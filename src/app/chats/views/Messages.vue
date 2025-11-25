<template>
    <div class="flex flex-col h-screen overflow-hidden">
        <!-- Fundo fixo com cor + pattern oficial -->
        <div class="fixed top-0 w-full">
            <ChatHeader @go-back="router.back()" :loading="loading" :conversation="conversation" />
        </div>

        <div ref="messagesContainer" :style="{ paddingBottom: inputHeight + 'px' }"
            class="flex-1 mt-[52px] pt-4 !overflow-y-scroll bg-chat-bg bg-cover">

            <div v-if="!loadingMessages">
                <div ref="loadTrigger" v-if="cachedMessages?.pagination?.hasMore"></div>
                <MessageBox v-for="(message, index) in cachedMessages?.items || []" 
                :key="message._id" 
                :message="message"
                :user-id="user?._id" 
                :previousMessage="cachedMessages?.items[index - 1]"
                />
            </div>
            <div class="h-full flex justify-center items-center w-full" v-else>
                <SpinnerSmall />
            </div>
        </div>


        <div class="z-[100]  dark:bg-dark-bg w-full">
            <MessageForm @auto-resize="scrollToBottom" ref="messageForm"
                :disabled="isLoadingSendMessage" @message-sent="handleSendMessage" />
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import MessageForm from '../components/MessageForm.vue';
import { useStore } from 'vuex';
import { computed, nextTick, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue';
import ChatHeader from '../components/ChatHeader.vue';
import MessageBox from '../components/MessageBox.vue';
import { getSocket } from '@/services/socket';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';
import { useIntersectionObserver } from "@vueuse/core";

const route = useRoute()
const store = useStore()
const socket = getSocket();
const router = useRouter()

const loading = ref(true)
const loadingMessages = ref(true)
const loadingMoreMessages = ref(false)
const isLoadingSendMessage = ref(false)
const loadingMore = ref(false)
const messagesContainer = ref(null)
const showScrollToBottom = ref(false);
const inputContainer = ref(null);
const inputHeight = ref(0); // altura inicial do input
const loadTrigger = ref(null)
const messageForm = ref(false)

const previousScrollHeight = ref(0)
const previousScrollTop = ref(0)

const convId = route.params.convId;

const user = computed(() => store.getters.currentUser || null)
const conversation = computed(() => store.getters.currentConversation)
const messages = computed(() => store.getters.messages)
const cachedMessages = computed(() => {
    return messages.value.find(module => module.byId === conversation.value?._id) || null
})

const getMessageFromCache = (byId) => {
    return messages.value.find(m => m.byId == byId) || null;
}

const handleSendMessage = async (message) => {
    const tempId = Math.random().toString(36).substring(2, 10);

    const newMessage = {
        content: message,
        conversation: conversation.value,
        created_at: Date.now(),
        read_by: [],
        sender: {
            profile_image: user?.value?.profile_image,
            _id: user?.value?._id,
            name: user?.value?.name,
            username: user?.value?.username,
        },
        status: "sending",
        updatedAt: Date.now(),
        _id: tempId
    }

    store.commit("ADD_MESSAGE_REALTIME", {
        convId: conversation.value?._id,
        message: newMessage
    })

    scrollToBottom();

    await store.dispatch("sendMessage", ({
        tempId,
        convId: conversation.value?._id,
        content: message
    }))
};

const scrollToBottom = async (smooth = true) => {
    await nextTick();
    const el = messagesContainer.value;
    if (el) {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
};


const loadMoreMessages = async () => {

    if (loadingMoreMessages.value || !cachedMessages.value?.pagination?.hasMore) return

    const container = messagesContainer.value
    if (!container) return

    // 1. Salva a altura atual ANTES de carregar mais
    previousScrollHeight.value = container.scrollHeight
    previousScrollTop.value = container.scrollTop


    loadingMoreMessages.value = true

    const page = cachedMessages.value?.pagination?.page + 1 || 2;
    const total = cachedMessages.value?.pagination?.total || null;
    const convId = cachedMessages.value?.byId || null
    const limit = 10

    loadingMoreMessages.value = true
    await store.dispatch("loadMessages", ({
        page,
        limit,
        convId,
        loadMore: true,
        total
    }))
        .finally(async () => {
            loadingMoreMessages.value = false

            // Restaura scroll
            await nextTick()
            const newScrollHeight = container.scrollHeight
            const heightDiff = newScrollHeight - previousScrollHeight.value
            container.scrollTop = previousScrollTop.value + heightDiff
        })
}

// === AJUSTAR ALTURA DO INPUT ===
const updateInputHeight = () => {
    if (!inputContainer.value) return;
    const rect = inputContainer.value.getBoundingClientRect();
    inputHeight.value = rect.height;
};

// Observa o último elemento da lista
let isLoadingMore = false

useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (
            isIntersecting &&
            cachedMessages.value?.pagination?.hasMore &&
            !isLoadingMore
        ) {
            isLoadingMore = true
            loadMoreMessages().finally(() => {
                isLoadingMore = false
            })
        }
    },
    { threshold: 0.1 }
)

let viewportHandler;

watch(() => route.params.convId, async (newId, oldId) => {
    if (!newId || newId === oldId) return;
    loadingMoreMessages.value = false
    messageForm.value.clearInput()

    const cachedMessages = getMessageFromCache(newId)
    if (cachedMessages) {
        await nextTick()
        scrollToBottom(false)
    } else {
        loadingMessages.value = true
        await store.dispatch("loadMessages", ({
            page: 1,
            limit: 10,
            convId: newId,
            hasMore: false
        }))
            .finally(() => {
                loading.value = false
                loadingMessages.value = false
                scrollToBottom(false)
            })
    }

    if (conversation?.value?.unread_count) {
        await store.dispatch("markAsRead", conversation.value?._id)
    }
})

onMounted(async () => {
    if (!conversation.value?._id) {
        await store.dispatch("getConversation", convId).then(async () => {
            await store.dispatch("loadMessages", ({
                page: 1,
                limit: 10,
                convId: conversation.value?._id,
                hasMore: false
            }))
                .finally(() => {
                    loading.value = false
                    loadingMessages.value = false
                })
            await nextTick()
            scrollToBottom(false);
        }).finally(async () => {
            loadingMessages.value = false
            loading.value = false

            if (conversation?.value?.unread_count) {
                await store.dispatch("markAsRead", conversation.value?._id)
            }
        })
    } else {
        if (conversation?.value?.unread_count) {
            await store.dispatch("markAsRead", conversation.value?._id)
        }

        loading.value = false

        if (!cachedMessages.value) {
            await store.dispatch("loadMessages", ({
                page: 1,
                limit: 10,
                convId: conversation.value?._id,
                hasMore: false
            }))
                .finally(() => {
                    loading.value = false
                    loadingMessages.value = false
                })
        } else {
            loadingMessages.value = false
            loading.value = false
        }
    }

    await nextTick()
    updateInputHeight();

    // Ajusta com teclado (mobile)
    viewportHandler = () => {
        const viewport = window.visualViewport;
        if (viewport) {
            scrollToBottom(false)
        }
    };

    window.visualViewport?.addEventListener('resize', viewportHandler);
    //window.visualViewport?.addEventListener('scroll', viewportHandler);

    scrollToBottom(false);

    if (socket) {
        socket.on('newMessage', async (msg) => {
            if (msg.conversation?._id === conversation.value._id) {
                await scrollToBottom();
            }
        });
    }
})

onUnmounted(() => {
    // SEMPRE remove o listener ao sair do componente
    socket.off('newMessage');
    window.visualViewport?.removeEventListener('resize', viewportHandler);
    //window.visualViewport?.removeEventListener('scroll', viewportHandler);
})
</script>