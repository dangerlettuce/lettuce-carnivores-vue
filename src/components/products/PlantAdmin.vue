<template>
  <div>
    {{
      `Total Inv: ${currentAvailablePlants.totalAvailable} ---
    Heli Count : ${currentAvailablePlants.heliCount} ---
    Heli Varieties: ${currentAvailablePlants.heliVarieties}
    `
    }}
  </div>
  <div class="layout">
    <div>
      <ItemSelect :options="plantCategories" v-model="plantCategoryToEdit" class="item-select" id="selectProduct" />
      <div>
        <div v-if="isExpanded">
          <PlantCategoryForm />
        </div>
        <div>
          <BaseButton @click="toggleExpand" type="info">
            {{ isExpanded ? 'Hide Form' : `Edit ${plantCategoryToEdit.name !== '' ? plantCategoryToEdit.name : 'Category'}` }}
          </BaseButton>
          <BaseButton @click="toggleArchived" type="info"
            >{{ showSoldArchived ? 'Hide' : 'Show' }}
            Archived/Sold
          </BaseButton>
        </div>
      </div>
      <div class="">
        <div v-for="(plant, index) in plantCategoryToEdit.plants" :key="index">
          <template v-if="displaySoldArchived(plant)">
            <hr style="margin-block: 0.4rem" />
            <div class="flex flex-row gap-1">
              <div class="up-down-arrows align-center text-center">
                <button class="px-1 py-0" v-if="index !== 0" @click="arrayMove(plantCategoryToEdit.plants, index, index - 1)">
                  <ThickArrowUp class="move-arrow" icon="caret-up" />
                </button>
                <button
                  v-if="index !== plantCategoryToEdit.plants.length - 1"
                  class="px-1 py-0"
                  @click="arrayMove(plantCategoryToEdit.plants, index, index + 1)"
                >
                  <ThickArrowDown class="move-arrow" icon="caret-down" />
                </button>
              </div>

              <PlantItemForm
                :plant
                :inventorySkus
                @triggerSave="saveCategory(plantCategoryToEdit)"
                @deletePlant="removePlant(index)"
                @createEbayItem="createEbayInventory(index)"
                @listEbayOffer="createEbayOffer(index)"
                @deleteEbayItem="deleteEbayItem(index)"
              />
            </div>
          </template>
        </div>
        <div class="mt-5">
          <BaseButton @click.prevent="addPlant(plantCategoryToEdit)">Add Plant Item</BaseButton>
          <BaseButton class="ms-4" @click.prevent="save"
            >Save <span class="spinner-border" role="status" v-show="isSaving"></span
          ></BaseButton>
        </div>
      </div>
    </div>
  </div>

  <PhotoUploadModal
    v-if="plantCategoryToEdit !== undefined"
    :photos="photoModalArr"
    :storageFolder="photoModalFolder"
    ref="photoModal"
    @triggerSave="saveCategory(plantCategoryToEdit)"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, provide, type Ref } from 'vue';
import ProductCard from '@/components/products/ProductCard.vue';
import PlantCategoryForm from '@/components/products/PlantCategoryForm.vue';
import PlantItemForm from '@/components/products/PlantItemForm.vue';
import ItemSelect from '@/components/ui/ItemSelect.vue';
import { usePlantStore } from '@/stores/plant';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import PhotoUploadModal from '@/components/photo/PhotoUploadModal.vue';
import { type PhotoItem } from '@/types/Product';
import { getCardName, getDisplayPrice, getCardPhoto } from '@/composables/useCardUtils';
import { getAllPlants } from '@/apis/dataServices';
import { toast } from 'vue3-toastify';
import { useInventoryStore } from '@/stores/inventory';
import type { Plant } from '@/types/Plant';
import ThickArrowUp from '@/assets/icons/ThickArrowUp.vue';
import ThickArrowDown from '@/assets/icons/ThickArrowDown.vue';

const { fetchAllCategories, findPlantCategoryById, setCategoryToEdit, saveCategory, addPlant, getAvailablePlants, removePlant } =
  usePlantStore();
const { plantCategories, plantCategoryToEdit, isSaving } = storeToRefs(usePlantStore());
const route = useRoute();
const { addUpdateEbayItem, listOnEbay, deleteItemFromEbay, getUpdatedInventory } = useInventoryStore();
const { inventorySkus } = storeToRefs(useInventoryStore());
onMounted(async () => {
  await fetchAllCategories();
  currentAvailablePlants.value = await fetchCurrentAvailablePlants();
  await getUpdatedInventory();
  //TODO: find a way to change nav to exclude :id without messy custom logic, and then change this to === undefined or null
  if (route.params.id !== ':id' && route.params.id !== undefined) {
    const plantCategory = await findPlantCategoryById(route.params.id as string);
    setCategoryToEdit(plantCategory);
  } else {
    setCategoryToEdit(null);
  }
});

async function save() {
  await saveCategory(plantCategoryToEdit.value);
}

const isExpanded = ref(true);
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

const showSoldArchived = ref(false);
function toggleArchived() {
  showSoldArchived.value = !showSoldArchived.value;
}
function displaySoldArchived(plant: Plant) {
  if (showSoldArchived.value) {
    return true;
  }
  return plant.status !== 'Sold' && plant.status !== 'Archived';
}
function arrayMove(arr: Array<any>, fromIndex: number, toIndex: number) {
  if (toIndex > arr.length - 1) {
    console.log('Unable to move in array, toIndex greater than arr.length. toIndex:' + toIndex + 'arr.length: ' + arr.length);
  }
  const ele = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, ele);
  save();
}

const currentAvailablePlants = ref({ totalAvailable: -1, heliCount: -1, heliVarieties: -1, nepCount: -1, cephCount: -1 });
async function fetchCurrentAvailablePlants() {
  const allPlants = await getAllPlants();
  const availablePlants = allPlants.filter((plant) => !['Hidden', 'Archived', 'Sold'].includes(plant.status) && plant.quantity !== 0);
  const heliCount = availablePlants
    .filter((plant) => plant.genus === 'Heliamphora')
    .reduce((acc, obj) => {
      return acc + obj.quantity;
    }, 0);
  const heliVarieties = [...new Set(availablePlants.filter((plant) => plant.genus === 'Heliamphora').map((heli) => heli.plantCategoryId))];
  const nepCount = availablePlants
    .filter((plant) => plant.genus === 'Nepenthes')
    .reduce((acc, obj) => {
      return acc + obj.quantity;
    }, 0);
  const cephCount = availablePlants
    .filter((plant) => plant.genus === 'Cephalotus')
    .reduce((acc, obj) => {
      return acc + obj.quantity;
    }, 0);
  return {
    totalAvailable: availablePlants.length,
    heliCount: heliCount,
    heliVarieties: heliVarieties.length,
    nepCount: nepCount,
    cephCount: cephCount,
  };
}

async function createEbayInventory(index: number) {
  const res = await addUpdateEbayItem(plantCategoryToEdit.value.plants[index], plantCategoryToEdit.value);
  if (typeof res === 'boolean') {
    if (res) {
      toast.success('Something probably worked');
      return;
    }
    toast.error('Something went wrong');
  }
}

async function deleteEbayItem(index: number) {
  const res = await deleteItemFromEbay(plantCategoryToEdit.value.plants[index].sku);
  if (res && res.success) {
    toast.success('Something probably worked');
    return;
  }
  toast.error('Something probably went wrong');
}

async function createEbayOffer(index: number) {
  const res = await listOnEbay(plantCategoryToEdit.value, plantCategoryToEdit.value.plants[index]);
  if (typeof res === 'boolean') {
    if (res) {
      toast.success('Something probably worked');
      return;
    }
    toast.error('Something went wrong');
  }
}

const photoModal = ref();
const photoModalFolder = ref('');
const photoModalArr: Ref<PhotoItem[]> = ref([]);
function managePhotos(folder: string, arr: PhotoItem[]) {
  photoModalFolder.value = folder;
  photoModalArr.value = arr;
  photoModal.value.toggleModal();
}
provide('managePhotos', managePhotos);
</script>

<style scoped>
.layout {
  margin-right: auto;
  margin-left: auto;
  padding-left: 0.5rem;
  padding-right: 0.1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 0.5rem;
}

.product-list {
  display: grid;
  gap: 0.2rem;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  margin: 2rem 0.2rem;
}

/* .item-select {
    width: 90%;
} */

/* .product-card {
    max-height: 40rem;
} */

.up-down-arrows {
  display: grid;
  min-width: 1.2rem;
}

@media (min-width: 82rem) {
  .product-list {
    grid-template-columns: repeat(auto-fit, minmax(26rem, 1fr));
    gap: 0.5rem;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.spinner-border {
  height: 1rem;
  width: 1rem;
  margin-left: 1rem;
}

/* @media(min-width: 62rem) {
    .layout {
        grid-template-columns: 5fr 1fr;
    }
} */
</style>

<!-- TODO: Bootstrap update buttons -->
