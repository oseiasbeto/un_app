<template>
  <div class="h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
    <!-- O DynamicScroller PRECISA ser o elemento raiz do scroll -->
    <DynamicScroller :items="conversations" :min-item-size="80" class="scroller" key-field="_id">
      <!-- HEADER FORA do scroll -->
      <template #before>
        <slot name="before-content"></slot>
        <!-- Loading -->
        <div v-if="loading">
          <ChatSkeleton v-for="n in 5" :key="n" />
        </div>
      </template>

      <!-- ITENS -->
      <template #default="{ item, active }">
        <DynamicScrollerItem :item="item" :active="active" class="scroller-item">
          <ChatListItem :conversation="item" :user-id="userId" 
            @click="$emit('select', item)" />
        </DynamicScrollerItem>
      </template>

      <!-- LOAD MORE -->
      <template #after>
        <div ref="loadTrigger" v-if="hasMore || loadingMore" class="load-more-container flex justify-center my-5">
          <SpinnerSmall/>
        </div>
      </template>
    </DynamicScroller>



    <!-- BOTÃO FLUTUANTE DO TELEGRAM -->
    <FloatingActionButton @new-chat="$emit('new-chat')" />
  </div>
</template>

<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { useIntersectionObserver } from '@vueuse/core';
import ChatListItem from './ChatListItem.vue';
import ChatSkeleton from './ChatSkeleton.vue';
import { ref } from 'vue';
import FloatingActionButton from '@/components/buttons/FloatingActionButton.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

defineProps({
  conversations: Array,
  loading: Boolean,
  loadingMore: Boolean,
  userId: String,
  hasMore: Boolean,
});

const emit = defineEmits(['select', 'new-chat', 'load-more']);

const loadTrigger = ref(null);

useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      emit('load-more');
    }
  }
);


const handleScroll = () => {

}
</script>