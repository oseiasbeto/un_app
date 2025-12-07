<template>
    <div @click="$emit('on-press')" class="text-text-secondary text-sm bg-background-secondary rounded-[30px] py-3 px-4">
        <p>{{ placeholder }}</p>
    </div>
</template>

<script setup>

defineProps({
    placeholder: {
        type: String,
        required: false,
        default: 'Pesquisar'
    }
})


defineEmits(['on-press'])
</script>