<template>
    <h1>Recompensas</h1>

    <button @click="openRewardsAd">Obter Recompensas</button>
</template>


<script setup>

import {
    rewardsAd,
} from "webtonative/AdMob";

const openRewardsAd = () => {
    rewardsAd({
        adId: "ca-app-pub-3940256099942544/5224354917",
        rewardsAdCallback: (value) => {
            console.log(value)
        }
    })
}
</script>