<template>
  <dialog ref="dialog" class="base-dialog" v-bind="attrs">
    <slot />
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect, useAttrs } from 'vue';

const dialog = ref<InstanceType<any> | undefined>(null);
const internalOpen = ref(false);
const props = defineProps<{ open: boolean; inline?: boolean }>();

const attrs = useAttrs();

function openCloseDialog() {
  if (!dialog?.value) return;
  if (props.open) dialog.value.show();
  else dialog.value.close();
}

function showHideDialog() {
  if (!dialog?.value) return;
  if (props.open) dialog.value.showModal();
  else dialog.value.close();
}

onMounted(() => {
  watchEffect(() => {
    if (props.open !== internalOpen.value) {
      if (props.inline) openCloseDialog();
      else showHideDialog();
      internalOpen.value = props.open;
    }
  });
});
</script>

<style scoped>
dialog {
  color: inherit;
}
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
