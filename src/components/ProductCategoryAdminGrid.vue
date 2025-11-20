<template>
  <BaseGrid
    id="product-category-admin"
    :columnDefs
    :defaultColumnDefs
    :gridOptions
    :rowData="productCategories"
    :isLoading
    ref="productCategoryGridRef"
    @rowValueChanged="categoryDataChanged" />
</template>

<script setup lang="ts">
  import BaseGrid from '@/components/BaseGrid.vue';
  import type { ColDef, GridOptions, ICellRendererParams, ISelectCellEditorParams, RowValueChangedEvent } from 'ag-grid-community';
  import { onMounted, ref, type Ref } from 'vue';
  import { useProductStore } from '@/stores/productStore';
  import { storeToRefs } from 'pinia';
  import { productCategoryList, productStatusList, subCategories } from "@/constants/constants";
  import { useTemplateRef } from 'vue';
  import type { PlantCategory, ProductCategory } from '@/types/Product';

  const productStore = useProductStore()
  const { productCategories, isLoading, isSaving } = storeToRefs(productStore)
  const { getProducts } = productStore

  const productCategoryGrid = useTemplateRef('productCategoryGridRef')

  const rowsThatNeedToSave: Ref<Set<number>> = ref(new Set())
  const autoSaveTimeoutId: Ref<number | null> = ref(null)
  function categoryDataChanged(params: RowValueChangedEvent<ProductCategory>) {
    if (!params || !params.data) return;
    const index = params.node.rowIndex
    if (index === null) return;
    rowsThatNeedToSave.value.add(index)
    //@ts-expect-error temporary adding isSaved to obj
    productCategories.value[index].isSaved = false;
    console.log(params)
    autoSave()
    return
  }

  function autoSave() {
    if (autoSaveTimeoutId.value !== null) {
      clearTimeout(autoSaveTimeoutId.value)
    }
    autoSaveTimeoutId.value = setTimeout(() => {
      save()
    }, 10000)
  }

  function save() {
    rowsThatNeedToSave.value.forEach(idx => {
      //@ts-expect-error
      delete productCategories.value[idx].isSaved
    })


  }

  const productCategoryData: Ref<Array<ProductCategory | PlantCategory>> = ref([])

  onMounted(() => {
    getProducts()
  })

  const defaultColumnDefs: ColDef = {
    editable: true,
  }

  const gridOptions: GridOptions<ProductCategory> = {
    editType: 'fullRow',
    autoSizeStrategy: {
      type: 'fitCellContents',
    },
    onRowValueChanged: categoryDataChanged,
  }

  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', editable: true, width: 64 },
    {
      field: 'category',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: productCategoryList
      },
      valueFormatter: (params) => params.data.id === '' ? 'New' : params.data.id,
      width: 120
    },
    {
      field: 'subCategory',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: getSubcategoryParams,
      width: 120
    },
    { field: 'name', editable: true, width: 240 },
    { field: 'description', editable: true },
    {
      field: 'status',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: productStatusList
      }
    },
    // { field: 'tags',  cellEditor: 'agTextCellEditor' },
    { field: 'createdDate', cellDataType: 'date', cellEditor: 'agDateCellEditor', },
    { field: 'dateUpdated', cellDataType: 'date', cellEditor: 'agDateCellEditor', },
    { field: 'saveStatus', cellDataType: 'text', editable: false },
    { field: 'isSaved', headerName: 'Saved', cellDataType: 'boolean', editable: false, }
  ]

  function getSubcategoryParams(params: ICellRendererParams): ISelectCellEditorParams {
    return { values: subCategories.get(params.data.category) ?? [] }
  }

</script>