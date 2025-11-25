<template>
  <div class="w-screen bg-background-primary h-screen flex justify-center items-center">
    <!-- Spinner com entrada e saída -->
    <div class="w-8 h-8 text-primary" :class="animationClass">
      <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const isExiting = ref(false)

const animationClass = computed(() => {
  if (isExiting.value) {
    return 'animate-[fade-out_0.6s_ease-in_forwards,spin-exit_0.6s_ease-in_forwards]'
  } else {
    return 'animate-[fade-in_0.6s_ease-out_forwards,spin-enter_0.6s_ease-out_forwards,spin_1s_linear_infinite]'
  }
})

const hideSpinner = () => {
  isExiting.value = true
  setTimeout(() => {

    isExiting.value = false
  }, 600) // Tempo da animação de saída
}

onMounted(() => {
  hideSpinner()
})
</script>