<template>
    <div
        class="fixed w-full top-0 z-50 bg-background-primary h-[52px] border-b border-border-primary">
        <div class="flex items-center h-full px-4 gap-3">
            <!-- Botão voltar -->
            <button @click="$emit('go-back', query)"
                class="p-1 text-text-secondary hover:bg-background-secondary mr-1 rounded-full transition-colors">
                <svg fill="none" width="24" viewBox="0 0 24 24" height="24">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z">
                    </path>
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
                    class="w-full pl-0 bg-transparent text-sm text-text-primary placeholder-text-secondary focus:outline-none"
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