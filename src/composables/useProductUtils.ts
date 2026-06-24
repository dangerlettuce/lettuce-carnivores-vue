import type { Product, ProductCategory, Plant, PlantCategory } from '@/types/Product';
import type { PlantCategory as OldPlantCategory } from '@/types/Plant';
import { deleteAllPhotosUtil } from '@/composables/usePhotoUtils';
import { findAll, deleteItem, findDocById } from '@/apis/dataServices';

export async function findProductById(id: number | string, collectionName: string) {
  const res = await findDocById(collectionName, id).catch((err) => console.log(err));
  return res as Product;
}
export async function getCategoryBySku(sku: string) {
  const categories = await findAll<OldPlantCategory>('plantCategories');
  if (Array.isArray(categories) === false) return;
  let categoryId: string | undefined = undefined;
  for (let category of categories) {
    const plantSkus = category.plants.map((plant) => plant.sku);
    if (plantSkus.includes(sku)) {
      categoryId = category.id;
      break;
    }
  }
  return categoryId;
}

export async function deleteById(id: number | string, collectionName: string, collectionList: Array<any>) {
  deleteAllPhotosUtil(await findProductById(id, collectionName));
  const res = await deleteItem(collectionName, id).catch((err) => {
    console.log(err);
    return { success: false, error: true, response: err, message: 'Unable to delete' };
  });
  if (res.error) {
    return { success: false, error: true, response: res.error, message: 'Unable to delete' };
  }
  const productIndex = collectionList?.findIndex((item) => item.id === id);
  if (collectionList && productIndex && productIndex > -1) {
    collectionList?.splice(productIndex, 1);
  }

  return { success: true, error: false, response: res, message: 'Deleted' };
}

export const newProductCategory: ProductCategory = {
  id: '',
  category: '',
  subCategory: '',
  name: '',
  description: '',
  status: 'Active',
  photos: [],
  tags: [],
  createdDate: new Date(),
  dateUpdated: new Date(),
};

export const newPlantCategory: PlantCategory = {
  ...newProductCategory,
  category: 'Plants',
  speciesHybrid: '',
  source: '',
  genus: '',
  clone: '',
};

export const newProduct: Product = {
  sku: '',
  quantity: 1,
  productCategoryId: null,
  price: null,
  status: 'Active',
  photos: [],
  createdDate: new Date(),
  updatedDate: new Date(),
};

export const newPlant: Plant = {
  ...newProduct,
  plantInfo: {
    size: '',
    propagationDate: new Date(),
    ageGroup: '',
    isSpecimen: false,
    shelfLocation: '',
  },
};
