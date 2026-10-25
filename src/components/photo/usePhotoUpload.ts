import { onBeforeUnmount, type Ref } from 'vue';
import { usePhotoManager, type SelectedFile } from "./usePhotoManager";
import type { PhotoItem } from "@/types/Product";
import { arrayMove } from '@/utils/utils';

type UsePhotoUploadOptions = {
  storageFolder: Ref<string>;
  saveFn: () => void;
  photos: Ref<PhotoItem[]>;
};

export function usePhotoUpload({ storageFolder, saveFn, photos }: UsePhotoUploadOptions) {

  const { selectedFiles, isSaving, uploadFiles, resetSelectedFiles, reloadImages, deleteAllPhotos, onFilesSelected, onFilesDropped } =
    usePhotoManager();

  onBeforeUnmount(() => {
    resetSelectedFiles();
  });

  function removePhoto(index: number, photo: SelectedFile | PhotoItem) {
    if (index !== -1) {
      photos.value = photos.value.filter((_, i) => i !== index);
      if (photo.hasOwnProperty('folder')) {
        deleteAllPhotos(photo as PhotoItem);
      }
      saveFn();
    }
  }

  function move(index: number, newPosition: number) {
    const nextPhotos = [...photos.value];
    arrayMove(nextPhotos, index, newPosition);
    photos.value = nextPhotos;
    saveFn();
  }

  async function filesDropped(e: DragEvent) {
    onFilesDropped(e);
    await upload();
  }
  async function upload() {
    await uploadFiles(storageFolder.value, photos);
    saveFn();
    setTimeout(reloadImages, 4250);
  }

  return {
    selectedFiles,
    isSaving,
    reloadImages,
    onFilesSelected,
    removePhoto,
    move,
    filesDropped,
    upload
  }
}