<template>
  <div @click="$emit('click')" class="flex items-center px-4 py-3.5 cursor-pointer transition-all duration-200
           hover:bg-light-bg/70 dark:hover:bg-dark-bg-secondary/70">
    <!-- Avatar com status online -->
    <div class="relative flex-shrink-0">
      <Avatar :url="user?.profile_image?.url || '/default-avatar.png'" size="md" class="w-12 h-12" alt="" />

      <!-- Online indicator (exatamente como Telegram) -->
      <div v-if="user?.is_online"
        class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-online rounded-full border-[3px] border-white dark:border-[#1e293b]" />

      <!-- Offline: pequeno círculo cinza (Telegram mostra apenas se o usuário esteve online recentemente) -->
      <div v-else-if="user?.last_seen_at"
        class="absolute bottom-0 right-0 w-2 h-2 bg-gray-400 rounded-full border-2 border-white dark:border-[#1e293b]" />
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 ml-4 min-w-0">
      <div class="flex items-center justify-between gap-3">
        <!-- Nome -->
        <h3 class="text-base font-medium text-gray-900 dark:text-white truncate leading-5">
          {{ user.name || user.username || user.phone_number }}
        </h3>
      </div>

      <!-- Bio ou username -->
      <!-- Última vez online (opcional, Telegram mostra em contatos) -->
      <span v-if="user?.last_seen && !user?.is_online"
        class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {{ formatLastSeen(user.last_seen) }}
      </span>
      <p v-else v-show="user.bio" class="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 leading-5">
        {{ user.bio }}
      </p>
    </div>

    <!-- Chevron direito (Telegram usa em listas de contatos) 
    <div class="ml-2 text-gray-400">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.29 6.71a1 1 0 0 0 0 1.42L13.59 12l-4.3 4.29a1 1 0 0 0 1.42 1.42l5-5a1 1 0 0 0 0-1.42l-5-5a1 1 0 0 0-1.42 0z"/>
      </svg>
    </div>-->
  </div>
</template>

<script setup>
//import { computed } from 'vue'
import Avatar from '@/components/Utils/Avatar.vue'

defineEmits(['click'])

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Formata "visto por último" igual ao Telegram
const formatLastSeen = (date) => {
  if (!date) return ''

  const now = new Date()
  const last = new Date(date)
  const diffMs = now - last
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'visto(a) agora há pouco'
  if (diffMin < 60) return `visto(a) há ${diffMin}m`
  if (diffHour < 24) return `visto(a) há ${diffHour}h`
  if (diffDay < 7) return `visto(a) há ${diffDay}d`
  return 'visto(a) há muito tempo'
}
</script>

<style scoped></style>