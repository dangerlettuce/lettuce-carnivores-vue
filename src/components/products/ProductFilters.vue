<template>
  <div class="filter-container">
    <div v-if="!isHidden" class="filter-item-container">
      <MultiSelect
        v-model="productFilters.status.items"
        display="chip"
        :options="statusList.filter((item) => !item.hidden)"
        optionLabel="label"
        placeholder="Status"
        :showToggleAll="false"
        class="filter-item"
      />

      <MultiSelect
        v-model="productFilters.genus.items"
        display="chip"
        :options="genusList.filter((item) => !item.hidden)"
        optionLabel="label"
        :showToggleAll="false"
        placeholder="Genus"
        class="filter-item"
      />

      <MultiSelect
        v-model="productFilters.experience.items"
        display="chip"
        :options="displayExperienceList"
        :showToggleAll="false"
        placeholder="Experience"
        class="filter-item"
      />

      <MultiSelect
        v-model="productFilters.other.items"
        optionLabel="label"
        display="chip"
        :options="otherFiltersList"
        filter
        placeholder="Other filters"
        class="filter-item"
      />

      <!-- <Select 
                v-model="sortMethod"
                :options="defaultSort"
                optionLabel="label"
                placeholder="Sort"
                class="filter-item" 
             /> -->
    </div>

    <!-- <div class="mt-3">
            <BaseButton type="primary-outline" size="small" @click="isHidden = !isHidden">{{`${isHidden ? 'Show' : 'Hide'} Filters`}}</BaseButton>

        </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { genusList, statusList, experienceList, otherFiltersList } from '@/constants/constants';
import { usePlantStore } from '@/stores/plant';
import { storeToRefs } from 'pinia';

const isHidden = ref(false);
const { productFilters } = storeToRefs(usePlantStore());
// const sortMethod = ref({...defaultSort})
const displayExperienceList = experienceList.filter((item) => item !== '');
onMounted(() => {
  productFilters.value.status.items = productFilters.value.status.items.filter((item) => !item.hidden);
  setFilterToggle();
});

function setFilterToggle() {
  const screenWidth = Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
  );
  if (screenWidth < 1350) {
    isHidden.value = true;
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.filter-item-container {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-item {
  max-width: 90dvw;
}

@media (min-width: 45rem) {
  .filter-container {
    margin: 0 7dvw;
  }
  .filter-item-container {
    gap: 1rem;
    flex-direction: row;
  }
}
</style>
