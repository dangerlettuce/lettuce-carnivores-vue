<template>
  <div class="game-container">
    <PumpkinBucket class="bucket" />
    <div class="letter-container">
      <LetterCard v-for="(letter, index) in myLetters" :key="index">{{ letter.toUpperCase() }}</LetterCard>
      <LetterCard v-for="(blank, index) in myBlanks" :key="index">_</LetterCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import PumpkinBucket from '@/assets/icons/halloween/PumpkinBucket.vue';
import LetterCard from './LetterCard.vue';
import { storeToRefs } from 'pinia';
import { useGiveawayStore } from '@/stores/giveaway';
const { myLetters, myBlanks } = storeToRefs(useGiveawayStore());
</script>

<style scoped>
.bucket {
}
.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.letter-container {
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 30%;
  max-width: 100%;
  gap: 0.5rem;
}
</style>
