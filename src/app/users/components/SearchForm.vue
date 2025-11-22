<template>
    <div
        class="fixed w-full top-0 z-50 bg-light-header dark:bg-dark-header border-b border-light-border dark:border-dark-border">
        <div class="flex items-center h-[55px] px-4 gap-3">
            <!-- Botão voltar -->
            <button @click="$emit('go-back', query)" class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                <svg class="w-6 h-6 text-light-text-secondary dark:text-white" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
            </button>

            <!-- Campo de busca -->
            <div class="flex-1 relative">
                <input 
                    ref="searchInput" 
                    v-model="query"
                    type="text"
                    @input="handleSearch"
                    placeholder="Buscar contatos..."
                    class="w-full pl-0 bg-transparent text-sm text-light-text dark:text-dark-text placeholder-gray-500 focus:outline-none"
                    autocomplete="off" 
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick, ref } from 'vue';

const emit = defineEmits(['go-back', 'search', 'clear-search'])

const query = ref('')
const searchInput = ref(null)

const handleSearch = () => {
    emit('search', query.value)
}

const clearSearch = () => {
    query.value = ''
    nextTick(() => searchInput.value.focus())
    emit('clear-search')
}


onMounted(() => {
    searchInput.value.focus()
})
</script>