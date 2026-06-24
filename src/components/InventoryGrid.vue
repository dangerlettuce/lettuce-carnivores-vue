<template>
  <AgGridVue :colDefs :rowData class="grid" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const rowData = ref([
  { sku: 1234, size: '2.5"', shelf: '1.1' },
  { sku: 1235, size: '3.5"', shelf: '3.1' },
  { sku: 1236, size: '4.5"', shelf: '1.1' },
]);
const colDefs = ref([{ field: 'sku' }, { field: 'size' }, { field: 'shelf' }]);
</script>

<style scoped>
.grid {
  min-width: 50rem;
  height: 30rem;
}
</style>
