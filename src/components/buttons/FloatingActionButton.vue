<template>
  <!-- Botão Flutuante do Telegram -->
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-16 opacity-0 scale-75"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-16 opacity-0 scale-75"
  >
    <button
      v-if="showFab"
      @click="$emit('new-chat')"
      class="fixed bottom-6 right-6 z-50 flex items-center justify-center
             w-16 h-16 bg-telegram-500 hover:bg-telegram-600 
             text-white rounded-full shadow-2xl 
             transition-all duration-300 transform active:scale-95
             focus:outline-none focus:ring-4 focus:ring-telegram-500/30"
    >
      <!-- Ícone de lápis (exato do Telegram) -->
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineEmits(['new-chat'])

const showFab = ref(true)
let scrollContainer = null

const handleScroll = () => {
  if (!scrollContainer) return
  const scrolled = scrollContainer.scrollTop > 100
  showFab.value = !scrolled
}

onMounted(() => {
  // Detecta automaticamente o container com rolagem (DynamicScroller, div com overflow, etc.)
  scrollContainer = document.querySelector('.scroller') 
                 || document.querySelector('.vue-recycle-scroller')
                 || document.querySelector('[class*="overflow"]')
                 || window

  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.addEventListener('scroll', handleScroll)
  } else {
    window.addEventListener('scroll', handleScroll)
  }

  // Valor inicial
  handleScroll()
})

onUnmounted(() => {
  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>