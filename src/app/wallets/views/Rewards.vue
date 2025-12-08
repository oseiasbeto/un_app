<template>
    <h1>Recompensas</h1>

    <button :disabled="isButtonDisabled" @click="openRewardsAd">
        {{ getButtonText }}
    </button>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { rewardsAd } from "webtonative/AdMob";

const loading = ref(false)
const cooldownTimer = ref(0)
let cooldownInterval = null

// Computed para verificar se o botão está desabilitado
const isButtonDisabled = computed(() => {
    return loading.value || cooldownTimer.value > 0
})

// Computed para o texto do botão
const getButtonText = computed(() => {
    if (loading.value) {
        return 'Aguarde o anúncio está carregando...'
    }
    if (cooldownTimer.value > 0) {
        return `Aguarde ${cooldownTimer.value}s`
    }
    return 'Obter Recompensas'
})

// Função para iniciar o cooldown
const startCooldown = () => {
    cooldownTimer.value = 30
    
    cooldownInterval = setInterval(() => {
        cooldownTimer.value--
        
        if (cooldownTimer.value <= 0) {
            clearInterval(cooldownInterval)
            cooldownInterval = null
        }
    }, 1000)
}

// Limpar intervalo quando o componente for destruído
onUnmounted(() => {
    if (cooldownInterval) {
        clearInterval(cooldownInterval)
    }
})

const openRewardsAd = () => {
    loading.value = true
    rewardsAd({
        adId: "ca-app-pub-3940256099942544/5224354917",
        rewardsAdCallback: (value) => {
            const status = value.status

            // Trata o status do anúncio de recompensas
            if (status === "success") {
                loading.value = false
            }

            if (status === 'adDismissed') {
                loading.value = false
            }

            if (status === 'adLoadFailure') {
                loading.value = false   
            }
            
            if (status === 'rewardSuccess') {
                alert("Recompensa concedida!")
                loading.value = false
                // Inicia o cooldown de 30 segundos após receber a recompensa
                startCooldown()
            }
        }
    })
}
</script>