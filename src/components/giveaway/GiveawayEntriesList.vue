<template>
    <BaseButton @click="getWinner(giveawayEntries)">Pick Winner</BaseButton>
    <section class="entries-grid">
        <template v-for="(entry, index) in giveawayEntries">
            <div>{{index}}</div>
            <div> {{ formatDisplayName(entry.displayName) }} </div>
            <div>Email: {{ entry.email }}</div>
            <div>Insta: {{ entry.instagram }}</div>
            <div>Face: {{ entry.facebook }}</div>
        </template>
    </section>

</template>

<script setup lang="ts">

import { onMounted, ref, type Ref } from 'vue'
import { findAll, findDocById } from '@/apis/dataServices'
import type { GiveawayEntry } from '@/types/Giveaway'
const giveawayCollectionName = 'giveaways'
const giveawayEntries: Ref<any[]> = ref([])
async function getGiveawayEntries() {
    return findAll('giveawayEntries')
}
onMounted(async () => {
    const res = await getGiveawayEntries()
    if(res) {
        giveawayEntries.value = res
    }
})

function getWinner(entries: GiveawayEntry[]) {
    if(entries.length === 0) {
        return null
    }
    const randomIndex = Math.floor(Math.random() * entries.length)
    const winner = entries[randomIndex];
    window.alert(`${randomIndex} ${formatDisplayName(winner.displayName)}`) + ' is the winner!'

}

function formatDisplayName(name: string) {
    if(!name) {return}
    const names = name.trim().toString().split(" ")
    if(names.length === 1) {
        return names[0]
    }

    return `${names[0]} ${names[1][0]}`

}
</script>

<style scoped>

.entries-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    margin-top: 1rem;
}
</style>