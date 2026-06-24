<template>
  <div
    :data-active="active"
    @dragenter.prevent="setActive"
    @dragover.prevent="setActive"
    @dragleave.prevent="setInactive"
    @drop.prevent="onDrop"
  >
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue';

const emit = defineEmits(['files-dropped']);
const active = ref(false);
const inactiveTimeout: Ref<number> = ref(0);
function setActive() {
  active.value = true;
  clearTimeout(inactiveTimeout.value);
}
function onDrop(e: DragEvent) {
  setInactive();
  emit('files-dropped', e);
}
function setInactive() {
  inactiveTimeout.value = setTimeout(() => {
    active.value = false;
  }, 50);
}
const preventDefault = (e: Event) => {
  e.preventDefault();
};
const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefault);
  });
});
onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefault);
  });
});
</script>
