import { UI_COPY } from '../data/copy';
import { PHOTO_MAX_BYTES } from '../data/defaults';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

type FileLike = Pick<File, 'name' | 'size' | 'type'>;

export interface LoadedPhoto {
  objectUrl: string;
  width: number;
  height: number;
}

interface LoadPhotoOptions {
  signal?: AbortSignal;
}

function createAbortError(): Error {
  return new DOMException('Photo loading was cancelled.', 'AbortError');
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

export function validatePhotoFile(file: FileLike): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeAllowed = ALLOWED_TYPES.has(file.type.toLowerCase());
  const extensionAllowed = ALLOWED_EXTENSIONS.has(extension);

  if (!typeAllowed && !extensionAllowed) {
    return UI_COPY.photo.errors.type;
  }
  if (file.size === 0) {
    return UI_COPY.photo.errors.empty;
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return UI_COPY.photo.errors.tooLarge;
  }
  return null;
}

function decodeImage(
  objectUrl: string,
  signal?: AbortSignal,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const image = new Image();
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort);
      image.onload = null;
      image.onerror = null;
    };

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      action();
    };

    const handleAbort = () => {
      image.src = '';
      finish(() => reject(createAbortError()));
    };

    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        finish(() => reject(new Error(UI_COPY.photo.errors.noDimensions)));
        return;
      }

      let decoded: Promise<void>;
      try {
        decoded = image.decode();
      } catch {
        finish(() => reject(new Error(UI_COPY.photo.errors.unreadable)));
        return;
      }

      decoded.then(
        () =>
          finish(() =>
            resolve({
              width: image.naturalWidth,
              height: image.naturalHeight,
            }),
          ),
        () => finish(() => reject(new Error(UI_COPY.photo.errors.unreadable))),
      );
    };

    image.onerror = () =>
      finish(() => reject(new Error(UI_COPY.photo.errors.unreadable)));

    signal?.addEventListener('abort', handleAbort, { once: true });
    image.src = objectUrl;
  });
}

export async function loadPhoto(
  file: File,
  options: LoadPhotoOptions = {},
): Promise<LoadedPhoto> {
  const validationError = validatePhotoFile(file);
  if (validationError) throw new Error(validationError);

  if (options.signal?.aborted) throw createAbortError();

  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await decodeImage(objectUrl, options.signal);
    if (options.signal?.aborted) throw createAbortError();
    return { objectUrl, ...dimensions };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}
