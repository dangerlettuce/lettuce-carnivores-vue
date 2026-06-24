import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { storage } from '@/apis/firebase';
import type { PhotoItem, PhotoSizes } from '@/types/Product';

export async function uploadFile(fileName: string, subfolder: string, file: File) {
  const filePath = `/${subfolder}/${fileName}`;
  const storageRef = ref(storage, filePath);
  try {
    const res = await uploadBytes(storageRef, file);
    return { success: true, filePath: res.metadata.fullPath, message: 'Photo uploaded' };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: 'Error uploading file', errorDetails: err };
  }
}

export async function deleteFile(photo: PhotoItem) {
  const storageRef = ref(storage, photo.path);
  if (!storageRef) {
    return { success: false, error: false, message: `Photo path ${photo.path} does not exist in Firebase` };
  }
  try {
    await deleteObject(storageRef);
    return { success: true, error: false, message: 'Deleted' };
  } catch (e) {
    console.log(e);
    return { success: false, error: true, message: 'Error deleting file from Firebase Storage', errorDetails: e };
  }
}

export async function deletePhoto(photoPath: string) {
  const storageRef = ref(storage, photoPath);
  if (!storageRef) {
    return { success: false, error: false, message: `Photo path ${photoPath} does not exist in Firebase` };
  }
  try {
    await deleteObject(storageRef);
    return { success: true, error: false, message: 'Deleted' };
  } catch (e) {
    console.log(e);
    return { success: false, error: true, message: 'Error deleting file from Firebase Storage', errorDetails: e };
  }
}

export async function getPhotoDownloadUrl(photo: PhotoItem, size: PhotoSizes = 1600) {
  const photoUrl = `https://firebasestorage.googleapis.com/v0/b/lettuce-carnivores.appspot.com/o/${photo.path}_${size}x${size}`;
  const storageRef = ref(storage, photoUrl);
  if (!storageRef) {
    return null;
  }
  try {
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e: any) {
    console.log(e);
    return null;
  }
}
