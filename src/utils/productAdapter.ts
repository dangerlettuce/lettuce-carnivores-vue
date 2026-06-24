import type { Plant as OldPlant, PlantCategory as OldPlantCategory } from '@/types/Plant';
import type { Product, ProductCategory, PlantCategory, Plant } from '@/types/Product';

export function plantToProduct(plant: OldPlant, plantCategory: OldPlantCategory) {
  const product = {
    sku: plant.sku,
    quantity: plant.quantity,
    productCategoryId: plantCategory.id,
    size: plant.size,
    price: plant.price,
    status: getProductStatus(plant.status),
    photos: plantCategory.photos,
    isDiscountable: null,
    createdDate: plant.dateListedForSale || new Date(),
    updatedDate: new Date(),
  } as Product;

  const productCategory = {
    id: plantCategory.id,
    category: 'Plants',
    subCategory: 'Carnivorous Plants',
    name: plantCategory.name,
    status: getCategoryStatus(plantCategory.status),
    photos: plantCategory.photos,
    isDiscountable: null,
    tags: [],
    createdDate: getOldestDate(plantCategory),
    dateUpdated: new Date(),
    description: plantCategory.description,
  } as ProductCategory;

  const newPlantCategory = {
    ...productCategory,
    category: 'Plants',
    speciesHybrid: plantCategory.speciesHybrid,
    source: '',
    genus: plantCategory.genus,
    clone: plantCategory.clone,
  } as PlantCategory;

  const newPlant = {
    ...product,
    plantInfo: {
      size: plant.size,
      propagationDate: plant.propagationDate,
      shipping: 'Standard',
      ageGroup: 'Adult',
      isSpecimen: false,
      shelfLocation: plant.shelfLocation,
    },
  } as Plant;

  return {
    product,
    productCategory,
    plantCategory: newPlantCategory,
    plant: newPlant,
  };
}

function getOldestDate(plantCategory: OldPlantCategory) {
  return plantCategory.plants.reduce((oldestDate, plant) => {
    if (!plant.dateListedForSale) return oldestDate;
    const date = new Date(plant.dateListedForSale);
    return oldestDate < date ? oldestDate : date;
  }, new Date());
}

function getCategoryStatus(status: OldPlantCategory['status']) {
  const statusMap = new Map([
    ['In Stock', 'active'],
    ['Coming Soon', 'inactive'],
    ['Archived', 'archived'],
    ['Hidden', 'hidden'],
    ['Sold', 'inactive'],
    ['Delete', 'archived'],
  ]);
  return statusMap.get(status);
}

function getProductStatus(status: OldPlant['status']) {
  const statusMap = new Map([
    ['In Stock', 'active'],
    ['Coming Soon', 'inactive'],
    ['Archived', 'archived'],
    ['Hidden', 'hidden'],
    ['Sold', 'sold'],
    ['Delete', 'archived'],
  ]);
  return statusMap.get(status);
}
