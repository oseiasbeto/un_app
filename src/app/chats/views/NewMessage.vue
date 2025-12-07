<template>
    <div>
        <div>
            <Navbar v-if="!showSearchForn" @go-back="router.back" title="Nova mensagem">
                <template #right>
                    <button @click="showSearchForn = true"
                        class="p-2 text-text-secondary hover:bg-background-secondary rounded-full transition-colors duration-150">
                        <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                </template>
            </Navbar>

            <SearchUsersForm @search="handleSearch" @go-back="closeSearchForm" v-else />
        </div>

        <div class="h-[51px]"></div>

        <VirtualUsers :ukey="ukey" :users="users.items || []" :loading="loadingLoadUsers"
            :loading-more="loadingMoreUsers" :has-more="users?.pagination?.hasMore" @load-more="loadMoreUsers"
            @select="select" />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import VirtualUsers from '../../users/components/VirtualUsers.vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es'
import Navbar from '@/components/UI/Navbar.vue';
import SearchUsersForm from '@/app/search/components/SearchUsersForm.vue';
import { getSocket } from '@/services/socket';

const loadingLoadUsers = ref(true)
const loadingMoreUsers = ref(false)
const loadingSearchUsers = ref(false)
const loadingOpenConv = ref(false)
const showSearchForn = ref(false)
const ukey = ref("")

const store = useStore()
const router = useRouter()

const socket = getSocket()

const users = computed(() => store.getters.users)

const select = async (user) => {
    if (loadingOpenConv.value) return

    loadingOpenConv.value = true
    await store.dispatch('openDirectMessage', user._id).then((conv) => {
        router.push('/messages/' + conv?._id)
    }).finally(() => {
        loadingOpenConv.value = false
    })

}

const closeSearchForm = async (q) => {
    showSearchForn.value = false

    if (q.trim()) {
        loadingLoadUsers.value = true
        store.commit("RESET_USERS")

        await store.dispatch("loadUsers", {
            page: 1,
            limit: 10
        }).finally(() => {
            loadingLoadUsers.value = false
        })
    } else return
}

const handleSearch = debounce(async (q) => {
    if (!q.trim()) {
        loadingSearchUsers.value = false
        loadingLoadUsers.value = true

        store.commit("RESET_USERS")

        await store.dispatch("loadUsers", {
            page: 1,
            limit: 10
        }).finally(() => {
            loadingLoadUsers.value = false
        })
        ukey.value = ""
    } else {
        await store.dispatch("searchUsers", q).then(items => {
            ukey.value = items?.length + '-' + Date.now()
        })
    }
}, 300)

const loadMoreUsers = async () => {
    if (loadingMoreUsers.value) return;

    // Indica carregamento
    loadingMoreUsers.value = true;

    // Calcula a próxima página
    const nextPage = users?.value?.pagination?.page + 1 || 2;
    const total = users?.value?.pagination?.total || 0;
    const limit = 20

    // Busca mais conversas
    await store.dispatch("loadUsers", ({
        page: nextPage,
        limit,
        total,
        loadMore: true
    }));

    // Finaliza o carregamento
    loadingMoreUsers.value = false;
};

onMounted(async () => {
    await store.dispatch("loadUsers", {
        page: 1,
        limit: 20
    }).finally(() => {
        loadingLoadUsers.value = false
    })
})
</script>