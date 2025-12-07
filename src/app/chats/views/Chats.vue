<template>
    <div
        class="shrink-0 fixed flex items-center top-0 w-full z-[100] px-5 h-[52px] border-b border-border-primary bg-background-primary">
        <div class="flex items-center justify-between">
            <div>
                <h2 class=" text-[26px] font-secondary font-bold text-text-primary">Mensagens</h2>
            </div>

            <div>

            </div>
        </div>
    </div>

    <div class="h-[51px]"></div>
    <div>
        <VirtualChatList :conversations="conversations?.items || []" :loading="loadingConversations"
            :loading-more="loadingMoreConversations" :user-id="user?._id" :has-more="conversations?.pagination?.hasMore"
            @select="select" @new-chat="router.push('/new-message')" @load-more="loadMoreConversations">
            <template #before-content>
                <div class="px-4 py-2">
                     <SearchWrapper @on-press="router.push('/rewards')" placeholder="Pesquisar" />
                </div>
            </template>
        </VirtualChatList>
    </div>

</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import VirtualChatList from '../components/VirtualChatList.vue';
import { useRouter } from 'vue-router';
import { getSocket } from '@/services/socket';
import SearchWrapper from '@/app/search/components/SearchWrapper.vue';

// Estado de carregamento para mais conversas
const loadingMoreConversations = ref(false);
const loadingConversations = ref(true)

// Acesso ao store Vuex
const store = useStore()
const router = useRouter()

const socket = getSocket()

const user = computed(() => store.getters.currentUser)

// Computed para acessar as conversas do store Vuex
const conversations = computed(() => {
    // Acessa as conversas do store Vuex
    return store.getters.conversations;
})

// Função para carregar mais conversas
const loadMoreConversations = async () => {
    if (loadingMoreConversations.value) return;

    // Indica carregamento
    loadingMoreConversations.value = true;

    // Calcula a próxima página
    const nextPage = conversations?.value?.pagination?.page + 1 || 2;
    const total = conversations?.value?.pagination?.total || 0;
    const limit = 10

    // Busca mais conversas
    await store.dispatch("loadConversations", ({
        page: nextPage,
        limit,
        total,
        loadMore: true
    }));

    // Finaliza o carregamento
    loadingMoreConversations.value = false;
};

const select = (conversation) => {
    // Lógica para selecionar uma conversa
    store.commit("SET_CONVERSATION", conversation)
    router.push('/messages/' + conversation?._id)
};

// Carrega as conversas ao montar o componente
onMounted(async () => {
    await store.dispatch("loadConversations", ({
        page: 1,
        limit: 10
    }))
        .finally(() => {
            loadingConversations.value = false
        })
});
</script>