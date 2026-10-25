import { ref, watch, type Ref } from 'vue';
import { defineStore } from 'pinia';
import type { PlantCategory, Plant } from '@/types/Plant';
import { type PhotoItem } from '@/types/Product';
import { saveItem, findAll, findDocById } from '@/apis/dataServices';
import { deleteById } from '@/composables/useProductUtils';
import { appendPhotoDataUtil, removePhotoUtil } from '@/composables/usePhotoUtils';
import { newPlantCategory, newPlant, defaultFilters } from '@/constants/constants';
import { toast } from 'vue3-toastify';
import { sortAlphabetically } from '@/utils/utils';
export const usePlantStore = defineStore('plant', () => {
  const isLoading = ref(false);
  const collectionName = 'plantCategories' as const;

  const plantCategories: Ref<PlantCategory[]> = ref([]);
  const plantCategoryToEdit: Ref<PlantCategory> = ref({ ...newPlantCategory });

  const setCategoryToEdit = (plantCategory: PlantCategory | null) => {
    if (plantCategory) {
      plantCategoryToEdit.value = plantCategory;
    } else {
      plantCategoryToEdit.value.plants.length = 0;
      plantCategoryToEdit.value = { ...newPlantCategory };
      plantCategoryToEdit.value.id = '';
    }
  };

  const isSaving: Ref<boolean> = ref(false);

  const saveCategory = async (plantCategory: PlantCategory) => {
    if (plantCategoryToEdit === null) {
      return false;
    }
    if (isDuplicate(plantCategory, 'id') || isDuplicate(plantCategory, 'sku')) {
      const duplicateIds = getDuplicates(plantCategory.plants, 'id');
      if (duplicateIds.length !== 0) {
        debugger
        toast.error('Duplicate Category ID detected: ' + formatDuplicateDetails(duplicateIds));
        console.log(duplicateIds);
        return false;
      }
      const duplicateSkus = getDuplicates(plantCategory.plants, 'sku');
      if (duplicateSkus.length !== 0) {
        toast.error('Duplicate SKU detected: ' + formatDuplicateDetails(duplicateSkus));
        return false;
      }
      return false;
    }
    isSaving.value = true;
    setDateListed(plantCategory);
    try {
      const res = await saveItem(collectionName, plantCategory);
      if (res?.success) {
        toast.success('Saved');
      } else {
        console.log(res?.errorDetails);
        console.log(plantCategory);
        toast.error((res as any).errorDetails.message);
      }
    } catch (e: any) {
      throw new Error(e.toString());
    } finally {
      isSaving.value = false;
      if (!plantCategories.value.some((plant) => plantCategory.id === plant.id)) {
        plantCategories.value.push(plantCategory);
      }
    }
  };

  function isDuplicate(plantCategory: PlantCategory, property: keyof PlantCategory['plants'][number]) {
    const ids = plantCategory.plants.map((plant) => plant[property]);
    const idSet = new Set(ids);
    return ids.length !== idSet.size;
  }

  function getDuplicates<T extends Record<string, any>>(items: T[], property: keyof T) {
    const seen = new Map<T[keyof T], number>();
    const duplicates: Array<{ value: T[keyof T]; firstIndex: number; duplicateIndexes: number[] }> = [];

    items.forEach((item, index) => {
      const value = item[property];
      const firstIndex = seen.get(value);

      if (firstIndex === undefined) {
        seen.set(value, index);
        return;
      }

      const existingDuplicate = duplicates.find((duplicate) => Object.is(duplicate.value, value));
      if (existingDuplicate) {
        existingDuplicate.duplicateIndexes.push(index);
        return;
      }

      duplicates.push({
        value,
        firstIndex,
        duplicateIndexes: [firstIndex, index],
      });
    });

    return duplicates;
  }

  function formatDuplicateDetails<T extends { value: any; firstIndex: number; duplicateIndexes: number[] }>(duplicates: T[]) {
    return duplicates
      .map((duplicate) => `${String(duplicate.value)} (first at index ${duplicate.firstIndex}, repeated at indexes ${duplicate.duplicateIndexes.slice(1).join(', ')})`)
      .join('; ');
  }

  function setDateListed(plantCategory: PlantCategory) {
    const now = new Date();
    plantCategory.plants.forEach((plant) => {
      if (plant.status === 'In Stock' && !plant.dateListedForSale) {
        plant.dateListedForSale = now;
      } else {
        plant.dateListedForSale = null;
      }
    });
  }

  const deleteCategoryById = async (id: number | string) => {
    const res = deleteById(id, collectionName, plantCategories.value);
    if (plantCategoryToEdit.value.id === id) {
      setCategoryToEdit(null);
      plantCategoryToEdit.value.plants.length = 0;
    }
    return res;
  };

  const findPlantCategoryById = async (id: number | string) => {
    isLoading.value = true;
    try {
      const res: unknown = await findDocById(collectionName, id);
      return res as unknown as PlantCategory;
    } catch (e: any) {
      throw new Error(e.toString());
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAllCategories = async () => {
    isLoading.value = true;
    try {
      const categories = await findAll(collectionName);
      if (categories !== undefined && categories.length !== 0) {
        plantCategories.value = categories as PlantCategory[];
      }
      sortAlphabetically(plantCategories.value, 'name' as keyof any[]);
    } catch (e: any) {
      throw new Error(e.toString());
    } finally {
      isLoading.value = false;
    }
  };

  const filteredCategories: Ref<PlantCategory[]> = ref([]);

  const updateFilteredCategories = () => {
    filteredCategories.value = getAvailableCategories();
  };
  const productFilters = ref({ ...defaultFilters });
  watch(
    () => productFilters.value,
    () => {
      if (plantCategories.value.length === 0) {
        return;
      }
      updateFilteredCategories();
    },
    { deep: true },
  );
  const getAvailableCategories = () => {
    const selectedOther = productFilters.value.other.items.map((item) => item.value);
    const selectedGenus = productFilters.value.genus.items.map((item) => item.value);
    const selectedExperience = productFilters.value.experience.items;
    const availableCategories = plantCategories.value.filter((category) => {
      const plants = getAvailablePlants(category);

      return plants.length > 0 && !['Hidden', 'Archived', 'Sold'].includes(category.status);
    });
    //@ts-ignore
    sortAlphabetically(availableCategories, 'name');
    return availableCategories;
  };
  const getAvailablePlants = (category: PlantCategory | undefined, includeHidden?: boolean, hiddenPassword?: string | null) => {
    if (category === undefined) {
      return [];
    }
    const selectedStatuses = productFilters.value.status.items.map((status) => status.value);
    const selectedOther = productFilters.value.other.items.map((item) => item.value);
    let visiblePlants = category.plants.filter(
      (plant) => plant.quantity > 0 && plant.status !== 'Archived' && plant.status !== 'Sold' && plant.price > 0,
    );
    if (includeHidden) {
      selectedStatuses.push('Hidden');
    }
    let filteredPlants = visiblePlants;
    filteredPlants = filteredPlants.filter((plant) => selectedStatuses.includes(plant.status));
    filteredPlants = filteredPlants.filter((plant) => (selectedOther.includes('Specimen') ? true : plant.isRepresentative));
    filteredPlants = filteredPlants.filter((plant) => (selectedOther.includes('Representative') ? true : !plant.isRepresentative));
    filteredPlants = filteredPlants.filter((plant) => (plant.password === undefined || plant.password === null || plant.password === '' || plant.password === hiddenPassword));
    return filteredPlants;
  };

  const addPlant = (plantCategory: PlantCategory) => {
    if (plantCategory.plants.length === 0) {
      const defaultPlant = { ...newPlant };
      defaultPlant.plantCategoryId = plantCategory.id;
      plantCategory?.plants.push({ ...defaultPlant });
    } else {
      const lastPlant = plantCategory.plants[plantCategory.plants.length - 1];
      const dateToUse = lastPlant.propagationDate === undefined ? new Date().toLocaleDateString('en-CA') : lastPlant.propagationDate;
      const nextId = lastPlant.id !== '' ? parseInt(lastPlant.id.toString()) + 1 : '';
      plantCategory?.plants.push({
        id: nextId.toString(),
        sku: nextId.toString(),
        isRepresentative: lastPlant.isRepresentative,
        size: '',
        propagationDate: dateToUse,
        status: 'In Stock',
        price: lastPlant.price,
        quantity: 1,
        photos: [],
        plantCategoryId: plantCategory.id,
        shelfLocation: lastPlant.shelfLocation ?? '',
        dateListedForSale: undefined,
      });
    }
  };

  const removePlant = async (index: number) => {
    plantCategoryToEdit.value.plants.splice(index, 1);
    await saveCategory(plantCategoryToEdit.value);
  };

  const appendPhotoData = async (plantCategory: PlantCategory, photoArr: Array<PhotoItem>) => {
    const res = appendPhotoDataUtil(plantCategory, photoArr);
    if (plantCategory.id) {
      saveCategory(plantCategory);
    }
    return res;
  };

  const removePhoto = async (plantCategory: PlantCategory, photoToRemove: PhotoItem) => {
    const res = removePhotoUtil(plantCategory, photoToRemove);
    if (plantCategory.id) {
      saveCategory(plantCategory);
    }
    return res;
  };
  async function getCategoryByPlant(plant: Plant) {
    if (plantCategories.value.length === 0) {
      fetchAllCategories();
    }
    return plantCategories.value.find((category) => category.id === plant.plantCategoryId);
  }

  function sortById(plantCategoryId: string) {
    const plantCategory = plantCategories.value.find((category) => category.id === plantCategoryId);
    if (plantCategory) {
      plantCategory.plants.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }
  }
  return {
    isLoading,
    isSaving,
    plantCategories,
    plantCategoryToEdit,
    setCategoryToEdit,
    saveCategory,
    deleteCategoryById,
    findPlantCategoryById,
    fetchAllCategories,
    addPlant,
    removePlant,
    appendPhotoData,
    removePhoto,
    getAvailablePlants,
    getAvailableCategories,
    sortById,
    productFilters,
    updateFilteredCategories,
    filteredCategories,
  };
});
