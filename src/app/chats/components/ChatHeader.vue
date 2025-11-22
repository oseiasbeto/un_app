<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex h-14 items-center px-4 bg-light-header dark:bg-dark-header border-b border-light-border dark:border-dark-border">
     <button @click="$emit('goBack')" class="p-1 hover:bg-black/5 dark:hover:bg-white/10 mr-1 rounded-full transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-light-text-secondary dark:text-white" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
     
    </button>
    <!-- Avatar -->
    <Avatar :url="loading ? '' : conversation?.avatar || ''" class="w-11 h-11 flex-shrink-0" />

    <!-- Informações do contato -->
    <div class="ml-3 flex-1 min-w-0">
      <!-- Nome -->
      <h2 class="text-base font-semibold text-light-text dark:text-dark-text truncate leading-tight">
        {{ loading ? 'Carregando...' : conversation?.name || 'Chat' }}
      </h2>

      <!-- Status (online / digitando / visto por último) -->
      <p class="text-xs text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1.5 leading-none">
        <!-- Carregando -->
        <span v-if="loading">conectando...</span>

        <!-- Online com bolinha verde piscando (igual Telegram) -->
        <span v-else-if="conversation?.is_online" class="flex items-center gap-1.5">
          <span class="relative">
            <span class="relative inline-flex h-2 w-2 rounded-full bg-online"></span>
          </span>
          online
        </span>

        <!-- Digitando com animação de 3 pontinhos -->
        <span v-else-if="conversation?.typing" class="flex items-center gap-0.5">
          digitando
          <span class="flex space-x-0.5">
            <span class="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span class="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-1 h-1 bg-current rounded-full animate-bounce"></span>
          </span>
        </span>

        <!-- Visto por último -->
        <span v-else>
          {{ conversation?.last_seen ? formatLastSeen(conversation.last_seen) : 'visto por último recentemente' }}
        </span>
      </p>
    </div>

    <!-- Botões da direita (busca e menu) -->
    <div class="flex items-center gap-3">
      <!-- Mais opções (3 pontinhos verticais) -->
      <button class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <svg class="w-5 h-5 text-light-text-secondary dark:text-white" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v.01M12 12v.01M12 19v.01" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'

defineProps({
  conversation: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

defineEmits(['goBack'])

// Formata "visto por último" como no Telegram
const formatLastSeen = (date) => {
  if (!date) return 'visto por último recentemente'
  const diff = Math.floor((Date.now() - new Date(date)) / 60000)
  if (diff < 1) return 'visto agora há pouco'
  if (diff < 60) return `visto há ${diff} min`
  if (diff < 1440) return `visto há ${Math.floor(diff / 60)} h`
  return 'visto por último há muito tempo'
}
</script>