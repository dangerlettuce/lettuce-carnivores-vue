<template>
  <Combobox v-model="model" by="label">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button variant="outline" class="select-category-button" :class="`w-[800px] max-w-[90dvw]`">
          {{ model?.name ? `${model.name} ${model?.clone} (${model.id}) - ${getInStockCount(model)}` : 'Select category' }}
          <ChevronsUpDownIcon class="opacity-50" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList class="w-[1000px] max-w-[90dvw] h-[800px] max-h-[70dvh]">
      <ComboboxInput placeholder="Search category..." />
      <ComboboxEmpty>No categories found.</ComboboxEmpty>
      <ComboboxGroup>
        <ComboboxItem v-for="option in options" :key="option.id" :value="option">
          <div class="categoryItem">
            <span>{{ option.id }}</span>
            <span>{{ option.name }} {{ option?.clone }}</span>
            <span>{{ getInStockCount(option) === 0 ? '-' : getInStockCount(option) }}</span>
          </div>
          <!-- {{ `${option.name} ${option?.clone} (${option.id}) - ${getInStockCount(option)}` }} -->
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

  .categoryItem {
    width: 100%;
    display: grid;
    gap: 1.2rem;
    grid-template-columns: 40px 1fr 20px;

    span {
      text-align: left;
    }
  }
</style>
