<template>
  <div class="id-grid">
    <template v-for="plant in plants" :key="plant.sku">
      <div class="align-center">{{ plant.sku }}</div>
      <div class="align-center">{{ plant.shelfLocation }}</div>
      <div class="align-center">{{ plant.size }}</div>
      <div class="align-center">{{ plant.status }}</div>
      <div class="align-center">{{ plant.name }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { findAll } from '@/apis/dataServices';
import type { Plant, PlantCategory } from '@/types/Plant';
import { ref, type Ref, onMounted } from 'vue';

type ExtendedPlant = Omit<Plant, 'size' | 'status'> & { name: string; clone: string; categoryId: string; size: string; status: string };

const plants: Ref<ExtendedPlant[]> = ref([]);

onMounted(async () => {
  const categories = await findAll<PlantCategory>('plantCategories');
  plants.value = flattenPlantCategories(categories);
});

function flattenPlantCategories(categories: PlantCategory[]) {
  const plantArr: ExtendedPlant[] = [];
  categories.forEach((category) => {
    category.plants.forEach((plant) => {
      plantArr.push({
        ...plant,
        size: plant.size.replace('deep', 'd').replace('Root', ''),
        status: plant.status.replace('In ', ''),
        name: category.name.replace('Heliamphora', 'H'),
        clone: category.clone,
        categoryId: category.id,
      });
    });
  });
  plantArr.sort((a, b) => a.sku.localeCompare(b.sku, 'en', { numeric: true }));
  return plantArr;
}
</script>

<style lang="scss" scoped>
.id-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 2fr 5fr;
}
</style>
