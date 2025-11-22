<template>
  <div
    @click="$emit('click')"
    :class="[
      'flex items-center border-b border-gray-100 dark:border-gray-800 px-5 py-4 cursor-pointer transition-all duration-200 relative',
      'hover:bg-light-bg/70 dark:hover:bg-dark-bg-secondary/70',
      isActive
        ? 'bg-light-bg dark:bg-dark-bg-secondary/90'
        : 'bg-transparent'
    ]"
  >
    <!-- Avatar com status online -->
    <div class="relative flex-shrink-0">
      <Avatar
        :url="conversation?.avatar || '/default-avatar.png'"
        size="md"
        class="w-14 h-14 rounded-full ring-2 ring-transparent"
        alt=""
      />

      <!-- Bolinha verde de online (só em conversas diretas) -->
      <div
        v-if="conversation.type === 'direct' && conversation.is_online"
        class="absolute bottom-0 right-0 w-4 h-4 bg-online rounded-full border-3 border-light-bg dark:border-dark-bg shadow-sm"
      >
        <span class="absolute inset-0 animate-ping rounded-full bg-online opacity-60"></span>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div class="flex-1 ml-4 min-w-0">
      <div class="flex items-center justify-between gap-3">
        <!-- Nome do contato -->
        <h3 class="text-base font-medium text-light-text dark:text-dark-text truncate max-w-[180px]">
          {{ conversation.name }}
        </h3>

        <!-- Horário da última mensagem -->
        <span :class="['text-xs flex-shrink-0',  
        conversation.unread_count ? 'text-telegram-400' : 'text-light-text-secondary dark:text-dark-text-secondary']">
          {{ formatMessageTime(conversation?.last_message?.created_at) }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-3 mt-1">
        <!-- Última mensagem + ícone de check se for enviada por você -->
        <p class="text-sm truncate max-w-[220px]" :class="`${conversation.unread_count ? 'text-light-text dark:text-white' : 'text-light-text-secondary dark:text-dark-text-secondary'}`">
          <!-- 
          <span v-if="conversation?.last_message?.sender._id === userId">
            <svg class="w-4 h-4 inline -mt-0.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path v-if="conversation.last_message?.status === 'read'"
                    d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path v-else d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>-->
          {{ conversation.last_message?.content || 'Nova conversa' }}
        </p>

        <!-- Badge de não lidas (igual Telegram) -->
        <div v-if="conversation?.unread_count" class="flex-shrink-0">
          <span class="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-telegram-500 rounded-full shadow-sm">
            {{ conversation.unread_count > 99 ? '99+' : conversation.unread_count }}
          </span>
        </div>

        <!-- Mute icon (opcional, se tiver silenciado) -->
        <svg v-if="conversation.muted"
             class="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5l7 7-7 7v-3H3v-4h6V5z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { formatMessageTime } from '@/utils/format-message-time'

defineProps({
  conversation: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  userId: { type: String, required: true } // ← adicione isso se ainda não tiver
})

defineEmits(['click'])
</script>