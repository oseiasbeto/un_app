<template>
    <!-- WhatsApp Android Header - Verde clássico -->
    <header
        class="fixed px-4 top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-light-header dark:bg-dark-header border-b border-light-border dark:border-dark-border">
        <div class="flex items-center">
            <!-- Botão Voltar -->
            <button @click="$emit('goBack')"
                class="mr-6 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors duration-150">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
            </button>

            <!-- Título centralizado -->
            <h1 class="text-lg font-medium text-white select-none">
                {{ title }}
            </h1>
        </div>

        <!-- Espaço vazio à direita para balancear (WhatsApp sempre deixa simétrico) -->
        <div>
            <slot name="right"></slot>
        </div>
    </header>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
        default: 'Título'
    }
})

defineEmits(['goBack'])
</script>