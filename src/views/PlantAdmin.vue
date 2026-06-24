<template>
  <div class="contain plant-admin">
    <PlantAdmin />
  </div>
</template>

<script setup lang="ts">
import PlantAdmin from '@/components/products/PlantAdmin.vue';
</script>

<style scoped>
@media (min-width: 62rem) {
  .plant-admin {
    margin: 0 2rem;
  }
}
</style>
