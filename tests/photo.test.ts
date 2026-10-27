import { describe, expect, it } from 'vitest';
import { PHOTO_MAX_BYTES } from '../src/data/defaults';
import { validatePhotoFile } from '../src/lib/photo';

const file = (name: string, type: string, size = 1024) => ({ name, type, size });

describe('validatePhotoFile', () => {
  it.each([
    ['portrait.jpg', 'image/jpeg'],
    ['portrait.png', 'image/png'],
    ['portrait.webp', 'image/webp'],
  ])('accepts supported files: %s', (name, type) => {
    expect(validatePhotoFile(file(name, type))).toBeNull();
  });

  it('accepts a valid extension when the MIME type is missing', () => {
    expect(validatePhotoFile(file('portrait.JPG', ''))).toBeNull();
  });

  it('rejects unsupported image types', () => {
    expect(validatePhotoFile(file('portrait.svg', 'image/svg+xml'))).toBe(
      'Choose a JPG, PNG or WebP image.',
    );
  });

  it('rejects files without a useful MIME type or extension', () => {
    expect(validatePhotoFile(file('portrait', 'application/octet-stream'))).toBe(
      'Choose a JPG, PNG or WebP image.',
    );
  });

  it('rejects empty files', () => {
    expect(validatePhotoFile(file('portrait.png', 'image/png', 0))).toBe(
      'That image file is empty. Please choose another photo.',
    );
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validatePhotoFile(file('portrait.png', 'image/png', PHOTO_MAX_BYTES))).toBeNull();
  });

  it('rejects files over the size limit', () => {
    expect(
      validatePhotoFile(file('portrait.png', 'image/png', PHOTO_MAX_BYTES + 1)),
    ).toBe('That photo is larger than 10 MB. Please choose a smaller image.');
  });
});
