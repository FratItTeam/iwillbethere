import { PHOTO_MAX_BYTES } from '../data/defaults';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

type FileLike = Pick<File, 'name' | 'size' | 'type'>;

export interface LoadedPhoto {
  dataUrl: string;
  width: number;
  height: number;
}

export function validatePhotoFile(file: FileLike): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeAllowed = ALLOWED_TYPES.has(file.type.toLowerCase());
  const extensionAllowed = ALLOWED_EXTENSIONS.has(extension);

  if (!typeAllowed && !extensionAllowed) {
    return 'Choose a JPG, PNG or WebP image.';
  }
  if (file.size === 0) {
    return 'That image file is empty. Please choose another photo.';
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return 'That photo is larger than 10 MB. Please choose a smaller image.';
  }
  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('The image could not be read.'));
      }
    };
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}

function decodeImage(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('That image file could not be opened.'));
    image.src = dataUrl;
  });
}

export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  const validationError = validatePhotoFile(file);
  if (validationError) throw new Error(validationError);

  const dataUrl = await readFileAsDataUrl(file);
  const dimensions = await decodeImage(dataUrl);
  if (!dimensions.width || !dimensions.height) {
    throw new Error('That image has no visible dimensions. Please choose another photo.');
  }

  return { dataUrl, ...dimensions };
}
