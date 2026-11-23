<template>
  <section class="sku-maintenance">
    <h2>SKU Maintenance</h2>
    <form class="sku-search" @submit.prevent="findSku">
      <label for="sku-search-input">SKU</label>
      <input id="sku-search-input" v-model="sku" type="text" autocomplete="off" />
      <BaseButton type="submit" :disabled="isSearching || !sku.trim()">
        Find SKU
        <span v-if="isSearching" class="spinner-border" role="status"></span>
      </BaseButton>
    </form>

    <p v-if="lookupError" role="alert">{{ lookupError }}</p>
    <p v-if="saveError" role="alert">{{ saveError }}</p>
    <p v-else-if="searchedSku && !isSearching && !found" role="status">
      SKU {{ searchedSku }} was not found in any category.
    </p>

    <div v-if="found" class="sku-result">
      <section class="category-details" aria-label="Plant category information">
        <p>{{ `${found.category.id} - ${found.category.name}` }}</p>
      </section>

      <PlantItemForm
        :plant="found.plant"
        :inventorySkus
        @triggerSave="saveSkuEdits"
        @createEbayItem="createEbayItem"
        @listEbayOffer="listEbayOffer"
        @deleteEbayItem="deleteEbayItem" />
      <BaseButton class="save-edits" :disabled="isSaving" @click.prevent="saveSkuEdits">
        Save edits
        <span v-if="isSaving" class="spinner-border" role="status"></span>
      </BaseButton>
    </div>

    <PhotoUploadModal
      v-if="found"
      ref="photoModal"
      v-model:photos="photoModalPhotos"
      :storageFolder="photoModalFolder"
      @triggerSave="saveSkuEdits" />
  </section>
</template>

<script setup lang="ts">
  import { onMounted, provide, ref, type Ref } from 'vue';
  import PlantItemForm from '@/components/products/PlantItemForm.vue';
  import PhotoUploadModal from '@/components/photo/PhotoUploadModal.vue';
  import { usePlantStore } from '@/stores/plant';
  import { useInventoryStore } from '@/stores/inventory';
  import { storeToRefs } from 'pinia';
  import { toast } from 'vue3-toastify';
  import type { Plant, PlantCategory } from '@/types/Plant';
  import type { PhotoItem } from '@/types/Product';

  const { fetchAllCategories, setCategoryToEdit, saveCategory } = usePlantStore();
  const { plantCategories, plantCategoryToEdit, isSaving } = storeToRefs(usePlantStore());
  const { addUpdateEbayItem, listOnEbay, deleteItemFromEbay, getUpdatedInventory } = useInventoryStore();
  const { inventorySkus } = storeToRefs(useInventoryStore());

  const sku = ref('');
  const searchedSku = ref('');
  const isSearching = ref(false);
  const lookupError = ref('');
  const saveError = ref('');
  const found = ref<{ category: PlantCategory; plant: Plant } | null>(null);

  async function findSku() {
    const requestedSku = sku.value.trim();
    if (!requestedSku) return;

    isSearching.value = true;
    searchedSku.value = requestedSku;
    lookupError.value = '';
    found.value = null;
    try {
      await fetchAllCategories();
      for (const category of plantCategories.value) {
        const plant = category.plants.find((item) => item.sku === requestedSku);
        if (plant) {
          setCategoryToEdit(category);
          found.value = { category, plant };
          break;
        }
      }
    } catch (error) {
      lookupError.value = `Unable to search for SKU ${requestedSku}: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      isSearching.value = false;
    }
  }

  async function saveSkuEdits() {
    if (!found.value || isSaving.value) return;

    saveError.value = '';
    try {
      await saveCategory(plantCategoryToEdit.value);
      sku.value = found.value.plant.sku;
      searchedSku.value = found.value.plant.sku;
    } catch (error) {
      saveError.value = `Unable to save SKU edits: ${error instanceof Error ? error.message : String(error)}`;
      toast.error(saveError.value);
    }
  }

  async function createEbayItem() {
    if (!found.value) return;
    const result = await addUpdateEbayItem(found.value.plant, found.value.category);
    toast[result ? 'success' : 'error'](result ? 'eBay item updated.' : 'Unable to update the eBay item.');
  }

  async function listEbayOffer() {
    if (!found.value) return;
    const result = await listOnEbay(found.value.category, found.value.plant);
    toast[result ? 'success' : 'error'](result ? 'eBay offer listed.' : 'Unable to list the eBay offer.');
  }

  async function deleteEbayItem() {
    if (!found.value) return;
    const result = await deleteItemFromEbay(found.value.plant.sku);
    toast[result?.success ? 'success' : 'error'](
      result?.success ? 'eBay item deleted.' : 'Unable to delete the eBay item.',
    );
  }

  onMounted(async () => {
    try {
      await getUpdatedInventory();
    } catch (error) {
      toast.error(`Unable to load eBay inventory: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  const photoModal = ref<{ toggleModal: () => void } | null>(null);
  const photoModalFolder = ref('');
  const photoModalPhotos: Ref<PhotoItem[]> = ref([]);

  function managePhotos(folder: string, photos: PhotoItem[]) {
    photoModalFolder.value = folder;
    photoModalPhotos.value = photos;
    photoModal.value?.toggleModal();
  }

  provide('managePhotos', managePhotos);
</script>

<style scoped>
  .sku-maintenance {
    margin: 1rem;
  }

  .sku-search {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .sku-search input {
    min-width: 16rem;
  }

  .sku-result {
    margin-top: 1.5rem;
  }

  .save-edits {
    margin-top: 0.75rem;
  }


  .category-details {
    border: 1px solid black;
    border-radius: 0.25rem;
    padding: 0.5rem;
  }

  .spinner-border {
    width: 1rem;
    height: 1rem;
    margin-left: 0.5rem;
  }
</style>
