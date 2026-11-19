import { onBeforeUnmount, type Ref } from 'vue';
import { usePhotoManager } from "./usePhotoManager";
import type { PhotoItem } from "@/types/Product";
import { arrayMove } from '@/utils/utils';

type UsePhotoUploadOptions = {
  storageFolder: Ref<string>;
  saveFn: () => void | Promise<void>;
  photos: Ref<PhotoItem[]>;
};

export function usePhotoUpload({ storageFolder, saveFn, photos }: UsePhotoUploadOptions) {

  const { selectedFiles, isSaving, uploadFiles, resetSelectedFiles, reloadImages, deleteAllPhotos, onFilesSelected, onFilesDropped } =
    usePhotoManager();

  onBeforeUnmount(() => {
    resetSelectedFiles();
  });

  async function removePhoto(index: number) {
    let targetIndex = index;
    if (targetIndex < 0 || targetIndex >= photos.value.length) {
      return;
    }

    const [removedPhoto] = photos.value.splice(targetIndex, 1);
    if (!removedPhoto) {
      return;
    }

    await Promise.resolve(saveFn());

    if (removedPhoto.folder && removedPhoto.name) {
      void deleteAllPhotos(removedPhoto).catch((err) => {
        console.error('Failed to delete one or more photo resolutions from storage', err);
      });
    }
  }

  function move(index: number, newPosition: number) {
    arrayMove(photos.value, index, newPosition);
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