<template>
  <div>
    <button @click="props.params.clickHandler(props.params.data)">Hi</button>
  </div>
</template>

<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community';
import type { PropType } from 'vue';

const props = defineProps({
  params: {
    type: Object as PropType<ICellRendererParams & { clickHandler: Function }>,
    required: true,
  },
});
</script>
