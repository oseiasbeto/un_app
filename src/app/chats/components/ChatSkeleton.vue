<template>
  <div class="flex w-full items-center px-5 py-4 border-b border-light-border dark:border-dark-border animate-pulse">
    <!-- Avatar skeleton -->
    <div class="relative flex-shrink-0">
      <div class="w-14 h-14 bg-gray-300 dark:bg-dark-bg-secondary rounded-full"></div>
      
      <!-- Bolinha online simulada (opcional – fica mais vivo) 
      <div class="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded border-3 border-light-bg dark:border-dark-bg"></div>-->
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 ml-4 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <!-- Nome -->
        <div class="h-3 w-40 bg-gray-300 dark:bg-dark-bg-secondary rounded"></div>
      
      </div>

      <div class="flex items-center justify-between gap-3">
        <!-- Última mensagem -->
        <div class="h-3 w-full bg-gray-300 dark:bg-dark-bg-secondary rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nada necessário aqui – é 100% estático
</script>

<style scoped>
/* Animação suave do pulse (melhor que a padrão do Tailwind em alguns casos) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>