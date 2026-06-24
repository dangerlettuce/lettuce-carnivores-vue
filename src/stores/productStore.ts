import { ref, type Ref } from 'vue';
import { defineStore } from 'pinia';
import type { Product, Plant, ProductCategory, PlantCategory, ExtendedProduct } from '@/types/Product';
import { deleteItemUpdateArray, findAll, findDocById, saveObjectUpdateArray } from '@/apis/dataServices';
import { newProduct, newProductCategory, newPlantCategory } from '@/composables/useProductUtils';
import { toast } from 'vue3-toastify';

export const useProductStore = defineStore('product', () => {
  const isSaving = ref(false);
  const isLoading = ref(false);
  const productCategories: Ref<Array<ProductCategory | PlantCategory>> = ref([]);
  const products: Ref<Array<Product | Plant>> = ref([]);

  async function getProductCategories() {
    isLoading.value = true;
    const res = await findAll<ProductCategory | PlantCategory>('productCategories');
    isLoading.value = false;
    if (Array.isArray(res)) {
      productCategories.value = res;
      return;
    }
    toast.error('Sorry, something went wrong. Please try again.');
  }

  async function getProducts() {
    isLoading.value = true;
    const res = await findAll<Product | Plant>('products');
    isLoading.value = false;
    if (Array.isArray(res)) {
      products.value = res;
      return;
    } else {
      products.value = [];
    }
    toast.error('Sorry, something went wrong. Please try again.');
  }

  function getExtendedProduct(sku: Product['sku']): ExtendedProduct | ExtendedProduct | null {
    const product = products.value.find((product) => product.sku === sku);
    const productCategory = productCategories.value.find((productCategory) => productCategory.id === product?.productCategoryId);
    if (!product || !productCategory) return null;
    return { ...product, categoryInfo: { ...productCategory } };
  }

  async function saveProductCategory(productCategory: ProductCategory | Omit<ProductCategory, 'id'>) {
    isSaving.value = true;
    await saveObjectUpdateArray<ProductCategory>({
      collectionName: 'productCategories',
      obj: productCategory,
      objArr: productCategories.value,
    });
    isSaving.value = false;
  }

  async function saveProduct(product: Product | Omit<Product, 'sku'>) {
    isSaving.value = true;
    await saveObjectUpdateArray<Product>({
      collectionName: 'products',
      obj: product,
      objArr: products.value,
      idKey: 'sku',
    });
    isSaving.value = false;
  }

  async function deleteProductCategory(id: ProductCategory['id']) {
    await deleteItemUpdateArray<ProductCategory | PlantCategory, 'id'>({
      collectionName: 'productCategories',
      id,
      objArr: productCategories.value,
    });
    return;
  }

  async function deleteProduct(id: Product['sku']) {
    await deleteItemUpdateArray<Product | Plant, 'sku'>({
      collectionName: 'products',
      id,
      objArr: products.value,
    });
    return;
  }

  function addNewProductCategory(quantity: number = 1) {
    for (let i = 0; i < quantity; i++) {
      productCategories.value.push({ ...newProductCategory });
    }
  }

  function addNewPlantCategory(quantity: number = 1) {
    for (let i = 0; i < quantity; i++) {
      productCategories.value.push({ ...newPlantCategory });
    }
  }

  return {
    productCategories,
    products,
    isLoading,
    isSaving,
    saveProductCategory,
    saveProduct,
    getProductCategories,
    getProducts,
    getExtendedProduct,
    deleteProduct,
    deleteProductCategory,
    addNewProductCategory,
    addNewPlantCategory,
  };
});
