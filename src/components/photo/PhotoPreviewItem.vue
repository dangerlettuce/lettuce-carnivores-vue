<template>
  <div class="flex-column-center">
    <div class="arrow-button">
      <button class="px-1 py-0" v-if="index !== 0" @click="$emit('move-up', index, index - 1)">
        <ThickArrowUp class="move-arrow" icon="caret-up" />
      </button>
    </div>
    <div class="arrow-button">
      <button v-if="!isLast" class="px-1 py-0" @click="$emit('move-down', index, index + 1)">
        <ThickArrowDown class="move-arrow" icon="caret-down" />
      </button>
    </div>
  </div>
  <div class="flex-column-center">
    <div>{{ photo.name }}</div>
  </div>

  <div class="flex-column-center">
    <img class="image-preview" :src="photoSrc(photo, 256)" />
  </div>
  <div class="flex-column-center">
    <div @click="$emit('remove-photo', index)">
      <BaseButton type="danger">Delete</BaseButton>
      <!-- <TrashcanIcon icon="dumpster-fire" size="lg" style="color: #f29c07" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { PhotoItem } from '@/types/Product';
import type { SelectedFile } from './usePhotoManager';
import { getPhotoUrl, type AllowedSizes } from '@/composables/usePhotoUtils';
import ThickArrowUp from '@/assets/icons/ThickArrowUp.vue';
import ThickArrowDown from '@/assets/icons/ThickArrowDown.vue';
import TrashcanIcon from '@/assets/icons/TrashcanIcon.vue';
import BaseButton from '../ui/BaseButton.vue';

const emit = defineEmits(['move-up', 'move-down', 'remove-photo']);
defineProps({
  photo: {
    type: Object as PropType<PhotoItem>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isLast: {
    type: Boolean,
    required: false,
  },
});

function photoSrc(photo: PhotoItem | SelectedFile, size: AllowedSizes = 256) {
  return getPhotoUrl((photo as PhotoItem).path, size);
}
</script>

<style scoped lang="scss">
.flex-column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.move-arrow {
  --fa-li-margin: 0;
}
.arrow-button {
  min-width: 1rem;
}
.image-preview {
  height: 20dvh;
  width: 100%;
  object-fit: cover;
}
</style>
