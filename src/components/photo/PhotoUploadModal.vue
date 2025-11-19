<template>
  <BaseDialog :open class="bg-dark border-0 rounded p-0">
    <div class="photo-modal p-3">
      <header class="mb-2 border-0">
        <h5 class="modal-title text-light">Manage Photos</h5>
        <div class="text-info align-center">Photos will take ~30s to load after uploading</div>
        <button type="button" class="" aria-label="Close" data-bs-dismiss="modal" @click="toggleModal"></button>
      </header>
      <div class="modal-body photo-items-grid">
        <template v-for="(photo, index) of photos" :key="photo.name">
          <PhotoPreviewItem :photo :index :isLast="index === photos.length" @move-up="move" @move-down="move"
            @remove-photo="(i) => removePhoto(i, photo)" />
        </template>
      </div>
      <DragUpload @files-dropped="filesDropped" #default="{ dropZoneActive }">
        <label class="drag-area" :class="dropZoneActive ? 'highlight' : ''">
          <span v-if="dropZoneActive">
            <span>Drop files here</span>
          </span>
          <span v-else>
            <span>Drag files here to upload</span>
            <span class="smaller"> or click here to select files </span>
          </span>
          <input type="file" id="file-input" multiple @change="onFilesSelected($event)" />
        </label>
      </DragUpload>
      <footer class="bg-dark">
        <div class="">
          <div v-if="selectedFiles.length !== 0" class="d-inline-block mx-3 text-light">{{ selectedFiles.length }} files
            selected</div>
        </div>
        <div class="flex flex-row gap-2">
          <BaseButton type="button" @click="upload" :disabled="selectedFiles.length === 0 || isSaving"
            :loading="isSaving">
            Upload <span v-if="isSaving" class="spinner-border"></span>
          </BaseButton>
          <BaseButton @click="reloadImages" data-bs-dismiss="modal" :disabled="isSaving || photos.length === 0">
            Reload Images
          </BaseButton>
          <BaseButton @click="toggleModal" data-bs-dismiss="modal" :disabled="selectedFiles.length !== 0">
            Close
          </BaseButton>
        </div>
      </footer>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, type PropType, toRefs, onBeforeUnmount } from 'vue'
import type { PhotoItem } from '@/types/Product'
import BaseDialog from '@/components/ui/BaseDialog.vue'
import DragUpload from '@/components/photo/DragUpload.vue'
import PhotoPreviewItem from './PhotoPreviewItem.vue'
import { arrayMove } from '@/utils/utils'
import { usePhotoManager, type SelectedFile } from './usePhotoManager'

const emit = defineEmits(['triggerSave'])
const props = defineProps<{ storageFolder: string }>()
defineExpose({ toggleModal })
const { selectedFiles, isSaving, uploadFiles, resetSelectedFiles, reloadImages, deleteAllPhotos, onFilesSelected, onFilesDropped } =
  usePhotoManager()

onBeforeUnmount(() => {
  resetSelectedFiles()
})

const open = ref(false)
function toggleModal() {
  open.value = !open.value
}

const photos = defineModel('photos', { type: Object as PropType<PhotoItem[]>, required: true })

function removePhoto(index: number, photo: SelectedFile | PhotoItem) {
  if (index !== -1) {
    photos.value.splice(index, 1)
    if (photo.hasOwnProperty('folder')) {
      deleteAllPhotos(photo as PhotoItem)
    }
    emit('triggerSave')
  }
}

function move(index: number, newPosition: number) {
  arrayMove(photos.value, index, newPosition)
  emit('triggerSave')
}

async function filesDropped(e: DragEvent) {
  onFilesDropped(e)
  await upload()
}
async function upload() {
  await uploadFiles(props.storageFolder, photos)
  emit('triggerSave')
  setTimeout(reloadImages, 4250)
}
</script>

<style scoped>
input[type='file'] {
  display: none;
}

header {
  display: flex;
  justify-content: space-between;
  margin: 0 1.5rem 0;
  box-sizing: border-box;
}

footer {
  display: flex;
  padding-top: 1rem;
  justify-content: space-around;
  box-sizing: border-box;
}

.hide {
  display: none;
}

.photo-modal {
  min-width: 50rem;
  overflow: none;
}

.modal-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.modal-footer--sticky {
  position: sticky;
  bottom: 0;
  margin: 0.5rem 0;
  gap: 0.5rem;
}

.photo-items-grid {
  display: grid;
  grid-template-columns: 1fr 4fr 4fr 1fr;
  gap: 1rem 0;
  height: 65dvh;
  overflow-y: auto;
  min-height: 20rem;
}

.drag-area {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10rem;
  border: 2px solid lightgray;
  border-radius: 0.5rem;
  cursor: pointer;
}

.highlight {
  backdrop-filter: brightness(135%);
}

.spinner-border {
  height: 1rem;
  width: 1rem;
  margin-left: 1rem;
}

.list-move {
  transition: transform 0.75s;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.75s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
<!-- 
TODO Bootstrap update form and buttons -->