<template>
  <BaseDialog :open class="bg-dark border-0 rounded p-0" @click="toggleDialog">
    <div class="image-container">
      <div class="image-hover-container">
        <BaseButton type="close" class="close" aria-label="Close" data-bs-dismiss="modal" @click="$emit('closeModal')" />
        <img :src="getPhotoUrl(photo?.path?.toString(), 1600)" :alt="`An an image of ${photo.name}`" />
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';
import BaseDialog from '@/components/ui/BaseDialog.vue';
import type { PhotoItem } from '@/types/Product';
import { getPhotoUrl } from '@/composables/usePhotoUtils';

const open = ref(false);
function toggleDialog() {
  open.value = !open.value;
}
defineProps({
  photo: {
    type: Object as PropType<PhotoItem>,
    required: true,
  },
});

defineExpose({
  toggleDialog,
});
</script>

<style scoped>
.image-hover-container {
  display: flex;
  justify-content: center;
}
.image-container {
  position: relative;
}
img {
  height: 94dvh;
  object-fit: cover;
  width: 100%;
}
.close {
  position: absolute;
  top: 0;
  right: 1rem;
  margin: 0.5em 0.5em;
  cursor: pointer;
}
.close:hover {
  cursor: pointer;
}
</style>
