<template>
  <div :class="[
    'flex mb-2 px-4',
    isSent ? 'justify-end' : 'justify-start'
  ]">
    <div :class="[
      'group relative max-w-[75%] px-4 py-3 rounded-2xl shadow-sm',
      isSent
        ? 'bg-telegram-600 text-white rounded-br-md'
        : 'bg-gray-100 text-black dark:bg-[#2b5278] dark:text-white rounded-bl-md'
    ]">
      <!-- Conteúdo da mensagem -->
      <p class="text-base leading-snug break-words">
        {{ message.content }}
      </p>

      <!-- Horário + status (sempre no canto inferior direito) -->
      <div class="flex items-end justify-end mt-1 gap-1">
        <span class="text-xs opacity-70">
          {{ formatMessageTime(message.created_at) }}
        </span>

        <!-- Status de envio (só aparece em mensagens enviadas) -->
        <div v-if="isSent" class="flex items-center">
          <!-- Enviando... -->
          <svg v-if="message?.status === 'sending'" class="w-4 h-4 animate-spin opacity-70" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>

          <!-- Enviada (um check) -->
          <svg v-else-if="message?.status === 'sent'" class="w-4 h-4" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>

          <!-- Lida (dois checks azuis) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.9L7.14286 16.5L15 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M20 7.5625L11.4283 16.5625L11 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMessageTime } from '@/utils/format-message-time'
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  userId: { type: String, required: true }
})

const isSent = computed(() => props.message.sender._id === props.userId)
</script>