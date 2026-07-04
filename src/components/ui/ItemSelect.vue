<template>


  <Combobox v-model="model" by="label">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button variant="outline" class="select-category-button" :class="`w-[90%] max-w-[600px]`">
          {{ model?.name ? `${model.name} ${model?.clone} (${model.id}) - ${getInStockCount(model)}` : 'Select category' }}
          <ChevronsUpDownIcon class="opacity-50" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList class="w-[80%] max-w-[600px]">
      <ComboboxInput placeholder="Search category..." />
      <ComboboxEmpty>No categories found.</ComboboxEmpty>
      <ComboboxGroup>
        <ComboboxItem v-for="option in options" :key="option.id" :value="option">
          {{ `${option.name} ${option?.clone} (${option.id}) - ${getInStockCount(option)}` }}
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
</template>

<script setup lang="ts" generic="T extends PlantCategory">
  import type { PlantCategory } from '@/types/Plant';
  import { ref, type PropType } from 'vue';
  import {
    Combobox,
    ComboboxAnchor,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
  } from '@/components/ui/combobox'
  import { Button } from '@/components/ui/button'
  import { ChevronsUpDownIcon } from '@lucide/vue'


  export type SelectItem = {
    id: string | number;
    name: string;
    clone?: string;
  };
  const model = defineModel({ type: Object as PropType<T> });
  const props = defineProps<{
    options: PlantCategory[];
    label?: string;
    id: string;
  }>();

  function getInStockCount(category: PlantCategory) {
    return Math.floor(category.plants.reduce((count, plant) => {
      return count + plant.quantity;
    }, 0));
  }
</script>

<style scoped>
  .select-category-button {
    background-color: white;
  }

  .select-category-width {
    width: clamp(300px, 300px, 800px);
  }
</style>
