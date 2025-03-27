<template>
  <div class="search-wrapper">
    <div class="relative w-full max-w-sm items-center">
      <Input id="search" type="text" v-model="searchTerm" @input="debouncedSearch" placeholder="Search..."
        class="pl-10" />
      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
        <Search class="size-6 text-muted-foreground" />
      </span>
    </div>
    <SearchResults :searchResults :searchTerm @navigate="handleResultSelection" />
  </div>
</template>

<script setup lang="ts">
  import { Input } from '@/components/ui/input'
  import { Search } from 'lucide-vue-next'
  import { onMounted, ref, type Ref } from 'vue';
  import { useDebounceFn } from '@vueuse/core';
  import uFuzzy from '@leeoniya/ufuzzy'
  import { usePlantStore } from '@/stores/plant';
  import { storeToRefs } from 'pinia';
  import type { PlantCategory } from '@/types/Plant';
  import SearchResults from '@/components/search/SearchResults.vue';
  const plantStore = usePlantStore()
  const { filteredCategories } = storeToRefs(plantStore)
  const { fetchAllCategories, updateFilteredCategories } = plantStore
  const emit = defineEmits(['navigate'])
  onMounted(async () => {
    if (filteredCategories.value.length === 0) {
      await fetchAllCategories();
      updateFilteredCategories()
    }
  })

  const searchTerm = ref('')

  const searchResults: Ref<PlantCategory[]> = ref([])

  function handleResultSelection() {
    searchTerm.value = ''
    searchResults.value.length = 0
    emit('navigate')
  }

  const uf = new uFuzzy({ intraMode: 1 });
  function executeSearch() {
    searchResults.value.length = 0
    if (!searchTerm.value || searchTerm.value.length < 3) return;
    const haystack = filteredCategories.value.map((ele, index) => [index, ele.name].join('|'))
    const idxs = uf.filter(haystack, searchTerm.value);
    if (idxs === null) return []
    const info = uf.info(idxs, haystack, searchTerm.value);
    const order = uf.sort(info, haystack, searchTerm.value);
    const results: Array<any> = []
    results.fill({}, 0, order.length)
    const maxResults = idxs.length > 8 ? 8 : idxs.length
    for (let i = 0; i < order.length; i++) {
      results[order[i]] = filteredCategories.value[idxs[i]]
      //results.push(filteredCategories.value[idxs[i]])
    }
    searchResults.value = results.slice(0, 8)
  }

  const debouncedSearch = useDebounceFn(executeSearch);

</script>