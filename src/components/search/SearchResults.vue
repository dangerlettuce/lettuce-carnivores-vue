<template>
  <Transition name="fade" appear>
    <div v-if="searchTerm.length > 2" class="search-container">
      <li v-if="searchResults.length === 0" class="no-results">No results found</li>
      <TransitionGroup tag="ul" name="list" appear>
        <li v-for="result in searchResults" :key="result.id" @click="navigate(result.id)">
          {{ result.name }}
        </li>
      </TransitionGroup>
    </div>
  </Transition>
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
    background-color: $accent-orange;
    border: 3px solid black;
    border-radius: .5rem;
    min-width: 60dvw;
    right: 0;
  }

  li:hover {
    background-color: $yellow-color;
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

  .list-enter-active,
  .list-leave-active {
    transition: all .3s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .list-move {
    transition: transform .3s ease;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-appear,
  .fade-leave-to {
    opacity: 0;
  }
</style>