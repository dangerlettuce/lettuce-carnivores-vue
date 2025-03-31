<template>
  <AgGridVue
    :id="id"
    :rowData
    :columnDefs
    :defaultColumnDefs
    :loading="isLoading"
    :style
    :theme="themeBalham"
    :groupDisplayType
    :gridOptions
    @grid-ready="onGridReady"
    @grid-destroyed="onGridDestroyed"
    suppressColumnVirtualisation />

</template>

<script setup lang="ts" generic="T">
  import { ref, shallowRef, watch, type PropType, type Ref, type ShallowRef } from 'vue';
  import { AgGridVue } from 'ag-grid-vue3'
  import { ClientSideRowModelModule, ModuleRegistry, TextEditorModule, SelectEditorModule, ValidationModule, ColumnAutoSizeModule, DateEditorModule, themeBalham } from 'ag-grid-community'
  import type { AgGridEvent, ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community'
  ModuleRegistry.registerModules([ClientSideRowModelModule, TextEditorModule, SelectEditorModule, ValidationModule, ColumnAutoSizeModule, DateEditorModule]);

  const gridApi: ShallowRef<GridApi | null> = shallowRef(null)
  let filters: Ref<{ [colId: string]: any } | undefined> = ref(undefined)

  defineExpose({
    gridApi
  })

  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    rowData: {
      type: Object as PropType<Array<T> | null>,
      required: true
    },
    defaultColumnDefs: {
      type: Object as PropType<ColDef>,
      required: false
    },
    columnDefs: {
      type: Object as PropType<ColDef[]>,
      required: true
    },
    style: {
      type: String,
      default: 'height: 50dvh; min-width: 90dvw;'
    },
    theme: {
      type: String,
      required: false,
      default: 'ag-theme-quartz'
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    quickFilterText: {
      type: String,
      required: false,
    },
    gridOptions: {
      type: Object as PropType<GridOptions>,
      required: false,
    },
    groupDisplayType: {
      type: Object as PropType<GridOptions['groupDisplayType']>,
      required: false
    }
  })


  // function updateFilters(params: ICellRendererParams) {
  //   filters.value = params.api.getFilterModel()
  // }

  function onGridReady(params: GridReadyEvent) {
    gridApi.value = params.api
    // updateFilters(params)
  }

  function onGridDestroyed() {
    gridApi.value = null
    filters.value = undefined
  }

  watch(
    () => props.quickFilterText,
    () => {
      if (gridApi.value && !gridApi.value.isDestroyed()) {
        gridApi.value.setGridOption('quickFilterText', props.quickFilterText)
      }
    }
  )
</script>

<style scoped>

  .grid-header-center .ag-header-cell-label {
    display: flex;
    justify-content: center;
  }

  .ag-group-value {
    display: inline-flex;
  }

</style>
