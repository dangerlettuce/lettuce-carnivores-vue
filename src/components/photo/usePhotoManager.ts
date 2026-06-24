import { ref, type Ref } from 'vue';
import { toast } from 'vue3-toastify';
import { uploadFile } from '@/apis/fileServices';
import type { PhotoItem } from '@/types/Product';
import { deletePhoto } from '@/apis/fileServices';
import { photoResolutions } from '@/constants/constants';
export type SelectedFile = {
  file?: File;
  tempUrl: string;
  name: string;
  originalName: string;
};
export function usePhotoManager() {
  const selectedFiles: Ref<SelectedFile[]> = ref([]);

  function resetSelectedFiles() {
    selectedFiles.value.length = 0;
  }

  function getFileName(originalName: string) {
    let name = originalName.replace('.jpg', '').replace('.jpeg', '').replace('.png', '');
    name = name.replaceAll(' ', '-');
    const regex = /\D/g;
    const now = new Date().toISOString().slice(6, 19).replaceAll(regex, '');
    return encodeURIComponent(`${name}-${now}`);
  }

  function onFilesSelected($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
      addFiles(target.files);
    }
  }
  function onFilesDropped(e: DragEvent) {
    if (!e.dataTransfer) {
      return;
    }
    addFiles(e.dataTransfer.files);
  }
  function addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const originalName = files[i].name;
      if (selectedFiles.value.some((file) => file.originalName === originalName)) {
        console.log(`That file already exists ${originalName}`);
        continue;
      }
      const name = getFileName(files[i].name);
      selectedFiles.value.push({
        file: files[i],
        tempUrl: URL.createObjectURL(files[i]),
        originalName,
        name: name,
      });
    }
  }

  const isSaving = ref(false);

  async function uploadFiles(folder: string, photoArr: Ref<PhotoItem[]>) {
    //upload seems to break if files are moved while awaiting upload.  Trying to create a local copy to see if
    //moving files in the folder causes this
    const photosToUpload = [...selectedFiles.value.filter((photo) => photo.file)];
    // const photosToUpload = selectedFiles.value.filter((photo) => photo.file)
    if (photosToUpload.length === 0) {
      toast.warning('No files to upload');
      return;
    }
    isSaving.value = true;
    let fileUploadCounter = 0;
    for (let photo of photosToUpload) {
      if (!photo.file) continue;
      const res = await uploadFile(photo.name, folder, photo.file);
      if (res && res.success === true && res.filePath) {
        photoArr.value.push({
          name: photo.name,
          folder,
          path: res.filePath,
          originalFilename: photo.originalName,
          date: new Date(),
          resolutions: photoResolutions,
        });

        fileUploadCounter++;
        if (fileUploadCounter >= photosToUpload.length) {
          toast.success(`${fileUploadCounter} of ${photosToUpload.length} files uploaded`);
        }
      } else {
        toast.error(`Sorry, something went wrong`);
      }
    }
    selectedFiles.value.length = 0;
    isSaving.value = false;
  }

  function reloadImages() {
    const imageDomElements = document.querySelectorAll('.image-preview') as unknown as HTMLImageElement[];
    imageDomElements.forEach((ele) => {
      const currentSource = ele.src;
      ele.src = '';
      setTimeout(() => {
        ele.src = currentSource;
      }, 20);
    });
  }

  async function deleteAllPhotos(photo: PhotoItem) {
    const resolutions = ['256x256', '512x512', '960x960', '1600x1600'];
    resolutions.forEach((resolution) => {
      deletePhoto(`plants/${photo.name}_${resolution}`);
    });
  }

  return { selectedFiles, resetSelectedFiles, onFilesSelected, onFilesDropped, isSaving, uploadFiles, reloadImages, deleteAllPhotos };
}
