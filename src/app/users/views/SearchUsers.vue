<template>
    <div class="flex flex-col h-screen bg-light-bg dark:bg-dark-bg">
        <!-- Header com campo de busca -->
        <div
            class="sticky top-0 z-50 bg-light-header dark:bg-dark-header border-b border-light-border dark:border-dark-border">
            <div class="flex items-center h-14 px-4 gap-3">
                <!-- Botão voltar -->
                <button @click="router.back()" class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                    <svg class="w-6 h-6 text-light-text-secondary dark:text-white" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M19 12H5m7-7l-7 7 7 7" />
                    </svg>
                </button>

                <!-- Campo de busca -->
                <div class="flex-1 relative">
                    <input ref="searchInput" v-model="query" @focus="focused = true" @blur="handleBlur" type="text"
                        placeholder="Buscar contatos..."
                        class="w-full pl-0 px-10 py-2 bg-transparent text-sm text-light-text dark:text-dark-text placeholder-gray-500 focus:outline-none"
                        autocomplete="off" />
 
                    <!-- Limpar -->
                    <button v-if="query" @click="clearSearch" class="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                        <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Resultados -->
        <div class="flex-1 overflow-y-auto">
            <!-- Loading inicial -->
            <div v-if="loading && !results.length" class="p-8 text-center">
                <div
                    class="inline-block animate-spin w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full">
                </div>
            </div>

            <!-- Sem resultados -->
            <div v-else-if="!loading && !results.length && query" class="p-8 text-center text-gray-500 text-sm">
                Nenhum usuário encontrado
            </div>

            <!-- Lista de resultados -->
            <div v-else>
                <button v-for="user in results" :key="user._id" @click="selectUser(user)"
                    class="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Avatar :url="user.profile_image?.url" size="md" class="w-12 h-12" />
                    <div class="flex-1 text-left min-w-0">
                        <p class="font-medium text-light-text dark:text-dark-text truncate">{{ user.name }}</p>
                        <p class="text-sm text-gray-500 truncate">@{{ user.username }}</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { debounce } from 'lodash-es' // npm install lodash-es
import Avatar from '@/components/Utils/Avatar.vue'
import api from "@/api";

const router = useRouter()
const store = useStore()

const query = ref('')
const searchInput = ref(null)
const results = ref([])
const loading = ref(false)
const focused = ref(false)

// Debounce de 300ms — evita spam no backend
const search = debounce(async (q) => {
    if (!q.trim()) {
        results.value = []
        loading.value = false
        return
    }

    loading.value = true
    try {
        const res = await api.get('/users/new-message', {
            params: { q: q.trim() }
        })
        results.value = res.data.users || []
    } catch (err) {
        console.error('Erro na busca:', err)
        results.value = []
    } finally {
        loading.value = false
    }
}, 300)

// Watch na query
watch(query, (newVal) => {
    search(newVal)
})

// Limpar busca
const clearSearch = () => {
    query.value = ''
    results.value = []
    nextTick(() => searchInput.value.focus())
}

// Perde foco com delay (permite clique no resultado)
const handleBlur = () => {
    setTimeout(() => { focused.value = false }, 200)
}

// Abrir conversa
const selectUser = async (user) => {
    loading.value = true
    try {
        const conv = await store.dispatch('openDirectMessage', user._id)
        router.push(`/messages/${conv._id}`)
    } catch (err) {
        console.error('Erro ao abrir conversa:', err)
    }
}
</script>