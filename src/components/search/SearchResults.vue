<template>
  <div v-if="searchTerm.length > 2" class="search-container">
    <div v-if="searchResults.length === 0" class="no-results">No results found</div>
    <ol v-else>
      <li v-for="result in searchResults" :key="result.id" @click="navigate(result.id)">
        {{ result.name }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
  import { router } from '@/router';
  import type { PlantCategory } from '@/types/Plant';

  const emit = defineEmits(['navigate'])

  defineProps<{
    searchResults: PlantCategory[],
    searchTerm: string,
  }>()

  function navigate(id: string) {
    emit('navigate')
    router.push({ name: 'productDetails', params: { id } })
  }
</script>

<style scoped lang="scss">

  .search-container {
    background-color: $primary;
    border: 3px solid black;
    border-radius: .5rem;
    min-width: 60dvw;
    right: 0;
  }

  li:hover {
    background-color: $dark-primary;
  }

  li,
  .no-results {
    padding: .6rem;
  }

  li {
    cursor: pointer;
  }

  @media(min-width: 50rem) {
    .search-container {
      position: absolute;
      min-width: 30rem;
    }
  }

  @media(min-width: 80rem) {
    .search-container {
      min-width: 40rem;
    }
  }
</style>