import api from '../../api'

export default {
    state: {
        users: {
            items: [],
            pagination: {}
        }
    },
    mutations: {
        LOAD_USERS(state, { items, pagination, loadMore }) {
            if (!loadMore) {
                state.users.items = items;
                state.users.pagination = pagination;
            } else {
                const users = state.users.items

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueItems = items.filter(
                    (user) =>
                        !users.some(
                            (existingUser) => existingUser._id === user._id
                        )
                );
                console.log(items)
                console.log(uniqueItems)

                state.users.items = [
                    ...users,
                    ...uniqueItems
                ]
            }
        },
        RESET_USERS(state) {
            state.users = {
                items: [],
                pagination: {
                    page: 1,
                    total: 0,
                    totalPages: 0,
                    hasMore: false
                }
            }
        },
        SEARCH_USERS(state, { items = [], pagination = {} }) {
            state.users = {
                items: [...items],
                pagination: { ...pagination, hasMore: false } // busca geralmente não tem mais páginas
            }
        }
    },
    actions: {
        // Função para obter conversas
        async loadUsers({ commit }, { page = 1, limit = 10, loadMore = false, total = 0 }) {
            try {
                // Requisição para obter usuarios
                const response = await api.get('/users/new-message', {
                    params: {
                        page,
                        limit,
                        total: loadMore ? total : undefined
                    }
                });

                // Dados da resposta
                const data = response.data;

                // Itens de conversas
                const items = data.users || [];

                // Configuração de paginação
                const pagination = {
                    page: data.page, // Página atual
                    total: data.total, // Total de itens
                    totalPages: data.totalPages, // Total de páginas
                    hasMore: data.hasMore // Novo campo indicando se há mais páginas    
                };

                // Atualiza o store com as conversas
                commit("LOAD_USERS", { items, loadMore, pagination });


            } catch (err) {
                // Log de erro
                console.error("Failed to fetch users:", err);
                throw err;
            }
        },
        async searchUsers({ commit }, query) {
            try {
                // Requisição para obter usuarios
                const response = await api.get('/users/search', {
                    params: {
                        q: query
                    }
                });

                // Dados da resposta
                const data = response.data;

                // Itens de conversas
                const items = data.users || [];

                // Configuração de paginação
                const pagination = {
                    page: 1, // Página atual
                    total: 0, // Total de itens
                    totalPages: 1, // Total de páginas
                    hasMore: false // Novo campo indicando se há mais páginas    
                };

                // Atualiza o store com as conversas
                commit("SEARCH_USERS", { items, pagination });

                return items
            } catch (err) {
                // Log de erro
                console.error("Failed to search users:", err);
                throw err;
            }
        }
    },
    getters: {
        users: (state) => state.users
    }
}