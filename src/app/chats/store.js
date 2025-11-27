import { logger } from '@/utils/logger';
import api from '../../api'
import { getSocket } from '@/services/socket';

const socket = getSocket()

export default {
    state: {
        conversations: {
            items: [],
            pagination: {}
        },
        conversation: {},
        messages: []
    },
    mutations: {
        LOAD_CONVERSATIONS(state, { items, loadMore, pagination }) {
            if (!loadMore) {
                state.conversations.items = items;
                state.conversations.pagination = pagination;
            } else {
                const conversations = state.conversations.items

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueItems = items.filter(
                    (conv) =>
                        !conversations.some(
                            (existingConv) => existingConv._id === conv._id
                        )
                );

                state.conversations.items = [
                    ...conversations,
                    ...uniqueItems
                ]

                state.conversations.pagination = pagination
            }
        },

        SET_CONVERSATION(state, conversation) {
            state.conversation = conversation
        },

        LOAD_MESSAGES(state, newModule) {
            const modules = state.messages
            const byId = newModule?.byId || null

            const index = modules.findIndex(m => m.byId === byId)

            if (index === -1) {
                modules.push(newModule)
            } else {
                const module = modules[index]
                const messages = module.items

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueItems = newModule.items.filter(
                    (msg) =>
                        !messages.some(
                            (existingMsg) => existingMsg._id === msg._id
                        )
                );

                module.items.unshift(...uniqueItems)
                module.pagination = newModule.pagination
            }
        },

        UPDATE_UNREAD_COUNT_ON_CONVERSATION(state, { convId, count }) {
            if (!convId) return
            const conversations = state.conversations.items

            if (!conversations.length) return

            const index = conversations.findIndex(conv => conv._id === convId)

            if (index !== -1) {
                conversations[index].unread_count = count
            }
        },

        UPDATE_TYPING_ON_CONVERSATION(state, { convId, payload }) {
            if (!convId) return
            const conversations = state.conversations.items
            const conv = state.conversation

            if (!conversations.length) return

            const index = conversations.findIndex(conv => conv._id === convId)

            if (index !== -1) {
                conversations[index].is_typing = payload
            }

            if (conv && conv._id === convId) {
                conv.is_typing = payload
            }
        },

        UPDATE_MESSAGE(state, { byId, msgId, payload }) {
            if (!byId || !msgId || !payload) return

            const modules = state.messages
            const index = modules.findIndex(m => m.byId === byId)

            if (index !== -1) {
                const module = modules[index]
                const messages = module.items

                const indexMessage = messages.findIndex((m) => m._id == msgId)

                if (indexMessage !== -1) {
                    messages[indexMessage].status = 'sent'
                }
            }
        },

        UPDATE_CONVERSATION_ON_MESSAGE(state, { convId, newMessage, content, isInc = false, updateAt }) {
            if (!convId) return

            const conversations = state.conversations.items
            const index = conversations.findIndex(conv => conv._id === convId)

            if (index !== -1) {
                const conversation = conversations[index]
                if (index !== 0) {
                    conversations.splice(index, 1);
                    conversations.unshift(conversation);
                }

                conversation.last_message.content = content
                conversation.last_message.created_at = updateAt

                if (isInc) {
                    conversation.unread_count += 1
                }

                const modules = state.messages
                const indexMessage = modules.findIndex(m => m.byId === convId)

                if (indexMessage !== -1) {
                    const module = modules[indexMessage]

                    if (!module) return

                    const messages = module.items
                    const pagination = module.pagination

                    const existingMessageIndex = messages.findIndex(m => m?._id === newMessage?._id)

                    if (existingMessageIndex === -1) {
                        messages.push(newMessage)

                        const total = pagination.total;
                        const limit = pagination.limit || 10;

                        pagination.total = total + 1;
                        pagination.totalPages = Math.ceil(total / limit);
                    } return
                }

                // ordena por última mensagem (igual Telegram)
                conversations.sort((a, b) => {
                    const timeA = new Date(a.last_message?.created_at || a.createdAt)
                    const timeB = new Date(b.last_message?.created_at || b.createdAt)
                    return timeB - timeA
                })

            }
        },

        ADD_OR_UPDATE_CONVERSATION(state, conversation) {
            const updatedConv = conversation; // pode estar incompleto!
            const items = state.conversations.items;


            const index = items.findIndex(c => c._id === updatedConv._id);

            if (index !== -1) {
                // Atualiza apenas os campos que vieram (merge)
                state.conversations.items[index] = {
                    ...state.conversations.items[index], // mantém tudo que já tinha
                    last_message: updatedConv.last_message,                       // sobrescreve só o que veio novo
                    unread_count: updatedConv.unread_count,
                    // Garante que campos importantes não sumam:
                    _id: updatedConv._id || state.conversations.items[index]._id,
                };

                // Move para o topo
                const [conversation] = state.conversations.items.splice(index, 1);
                state.conversations.items.unshift(conversation);
            } else {
                // Nova conversa → adiciona no topo
                state.conversations.items.unshift(updatedConv);
            }
        },

        ADD_MESSAGE_REALTIME(state, { convId, message }) {
            const module = state.messages.find(m => m.byId === convId)

            if (!module) return

            const messages = module.items
            const pagination = module.pagination

            const existingMessageIndex = messages.findIndex(m => m?._id === message?._id)

            if (existingMessageIndex === -1) {
                messages.push(message)

                const total = pagination.total;
                const limit = pagination.limit || 10;

                pagination.total = total + 1;
                pagination.totalPages = Math.ceil(total / limit);
            } else return

            // atualiza last_message da conversa na sidebar
            const conversations = state.conversations.items
            const conv = conversations.find(c => c._id === convId)
            if (conv) {
                conv.last_message = {
                    _id: message._id,
                    sender: message.sender,
                    content: message.content || '[Mídia]',
                    message_type: message.message_type,
                    created_at: message.created_at
                }
            }
        },

        RESET_MESSAGES(state) {
            const modules = state.messages
            const byId = newModule?._id || null

            const index = modules.findIndex(m => m.byId === byId)

            if (index !== -1) {
                modules[index].items = []
            } else return
        },
    },
    actions: {
        // Função para obter conversas
        async loadConversations({ commit }, { page = 1, limit = 10, loadMore = false, total = 0 }) {
            try {
                // Requisição para obter conversas
                const response = await api.get('/conversations',
                    {
                        params: {
                            page,
                            limit,
                            total: loadMore ? total : undefined
                        }
                    }
                );

                // Dados da resposta
                const data = response.data;

                // Itens de conversas
                const items = data.conversations || [];

                // Configuração de paginação
                const pagination = {
                    page: data.page, // Página atual
                    total: data.total, // Total de itens
                    totalPages: data.totalPages, // Total de páginas
                    hasMore: data.hasMore // Novo campo indicando se há mais páginas    
                };

                // Atualiza o store com as conversas
                commit("LOAD_CONVERSATIONS", { items, loadMore, pagination });
            } catch (err) {
                // Log de erro
                logger.error("Failed to fetch conversations:", err);
                throw err;
            }
        },

        async loadMessages({ commit }, { page = 1, limit = 10, convId, loadMore = false, total = 0 }) {
            try {
                const response = await api.get(`/conversations/messages/${convId}`,
                    {
                        params: {
                            page,
                            limit,
                            total: loadMore ? total : undefined
                        }
                    }
                );

                const data = response.data;

                const items = data.messages || [];
                const byId = convId

                const pagination = {
                    page: data.page, // Página atual
                    total: data.total, // Total de itens
                    totalPages: data.totalPages, // Total de páginas
                    hasMore: data.hasMore // Novo campo indicando se há mais páginas    
                }

                const newModule = {
                    byId,
                    items,
                    pagination
                }

                commit("LOAD_MESSAGES", newModule)
            } catch (err) {
                // Log de erro
                logger.error("Failed to fetch messages:", err);
                throw err;
            }
        },

        // Função para enviar mensagem
        async sendMessage({ commit }, { convId, tempId, content }) {
            try {
                const response = await api.post("/conversations/new-message", {
                    convId,
                    content
                });

                const newMessage = response.data.data;

                if (tempId) {
                    commit("UPDATE_MESSAGE", {
                        byId: newMessage?.conversation?._id,
                        msgId: tempId,
                        payload: {
                            ...newMessage,
                            status: "sent"
                        }
                    })
                }
            } catch (err) {
                logger.error("Failed to send message:", err);
                throw err;
            }
        },

        async openDirectMessage({ commit }, userId) {
            try {
                const res = await api.post('/conversations/direct', { userId })
                const { conversation } = res.data

                commit('SET_CONVERSATION', conversation)

                return conversation
            } catch (err) {
                logger.error("Failed to open direct message:", err);
                throw err;
            }
        },

        async getConversation({ commit }, convId) {
            try {
                const res = await api.get(`/conversations/${convId}`)
                const { conversation } = res.data

                commit('SET_CONVERSATION', conversation)

                return conversation
            } catch (err) {
                logger.error("Failed to get conversation by id:", err);
                throw err;
            }
        },

        // Marcar como lido
        async markAsRead({ commit }, convId) {
            await api.post(`/conversations/${convId}/mark-as-read`)
            commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId, count: 0 })
        },
    },
    getters: {
        conversations: (state) => state.conversations,
        messages: (state) => state.messages,
        currentConversation: (state) => state.conversation,
    }
}