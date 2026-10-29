import { UI_COPY } from '../data/copy';
import type { ExportScale, PhotoSelection } from '../types';

export const FLYER_WIDTH = 1080;
export const FLYER_HEIGHT = 1350;
export const PORTRAIT_SAMPLE_SIZE = 200;
export const PORTRAIT_DIFF_THRESHOLD = 32;

const PORTRAIT_DECODE_TIMEOUT_MS = 5_000;
const OPAQUE_ALPHA_THRESHOLD = 250;
const MIN_COMPARED_PIXEL_RATIO = 0.5;
const MIN_PATCH_RANGE = 8;

interface FlyerBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CoverSourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PatchComparison {
  difference: number;
  comparedPixels: number;
  totalPixels: number;
}

export interface PortraitSnapshot {
  objectUrl: string;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
  box: FlyerBox;
  sample: FlyerBox;
}

export class PortraitError extends Error {
  constructor() {
    super(UI_COPY.export.photoError);
    this.name = 'PortraitError';
  }
}

export function reportExportIssue(code: string): void {
  if (import.meta.env.DEV) {
    console.warn(`[flyer-export] ${code}`);
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  error: Error,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(error), milliseconds);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (caught) => {
        window.clearTimeout(timer);
        reject(caught);
      },
    );
  });
}

function parseObjectPosition(value: string): [number, number] | null {
  const tokens = value.trim().split(/\s+/);
  if (tokens.length < 2) return null;

  const x = Number.parseFloat(tokens[0] ?? '');
  const y = Number.parseFloat(tokens[1] ?? '');
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function calculateCoverSourceRect(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number,
  boxHeight: number,
  positionX: number,
  positionY: number,
): CoverSourceRect {
  const safeWidth = Math.max(1, imageWidth);
  const safeHeight = Math.max(1, imageHeight);
  const scale = Math.max(boxWidth / safeWidth, boxHeight / safeHeight);
  const width = boxWidth / scale;
  const height = boxHeight / scale;
  const x = (safeWidth - width) * (clampPercentage(positionX) / 100);
  const y = (safeHeight - height) * (clampPercentage(positionY) / 100);

  return { x, y, width, height };
}

export function comparePatchPixels(
  expected: Uint8ClampedArray,
  actual: Uint8ClampedArray,
): PatchComparison {
  if (expected.length !== actual.length || expected.length % 4 !== 0) {
    throw new Error('Portrait patches must have matching RGBA lengths.');
  }

  let difference = 0;
  let comparedPixels = 0;

  for (let index = 0; index < expected.length; index += 4) {
    if (
      (expected[index + 3] ?? 0) < OPAQUE_ALPHA_THRESHOLD ||
      (actual[index + 3] ?? 0) < OPAQUE_ALPHA_THRESHOLD
    ) {
      continue;
    }

    difference += Math.abs((expected[index] ?? 0) - (actual[index] ?? 0));
    difference += Math.abs(
      (expected[index + 1] ?? 0) - (actual[index + 1] ?? 0),
    );
    difference += Math.abs(
      (expected[index + 2] ?? 0) - (actual[index + 2] ?? 0),
    );
    comparedPixels += 1;
  }

  const totalPixels = expected.length / 4;
  return {
    difference: comparedPixels ? difference / (comparedPixels * 3) : 0,
    comparedPixels,
    totalPixels,
  };
}

function hasPatchVariation(pixels: Uint8ClampedArray): boolean {
  let minimum = 255;
  let maximum = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    if ((pixels[index + 3] ?? 0) < OPAQUE_ALPHA_THRESHOLD) continue;
    const luminance =
      (pixels[index] ?? 0) * 0.299 +
      (pixels[index + 1] ?? 0) * 0.587 +
      (pixels[index + 2] ?? 0) * 0.114;
    minimum = Math.min(minimum, luminance);
    maximum = Math.max(maximum, luminance);
  }

  return maximum - minimum >= MIN_PATCH_RANGE;
}

export function isPortraitPatchAcceptable(
  comparison: PatchComparison,
  actualPixels: Uint8ClampedArray,
): boolean {
  if (comparison.totalPixels === 0) return false;

  if (
    comparison.comparedPixels >=
    comparison.totalPixels * MIN_COMPARED_PIXEL_RATIO
  ) {
    return comparison.difference <= PORTRAIT_DIFF_THRESHOLD;
  }

  return hasPatchVariation(actualPixels);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new PortraitError());
    image.src = src;
  });
}

export async function preparePortrait(
  node: HTMLElement,
  photo: PhotoSelection,
): Promise<PortraitSnapshot> {
  const images = Array.from(node.querySelectorAll<HTMLImageElement>('.flyer__photo'));
  const image = images[0];

  if (images.length !== 1 || !image) {
    reportExportIssue('portrait-missing');
    throw new PortraitError();
  }

  if (
    image.getAttribute('src') !== photo.objectUrl ||
    image.src !== photo.objectUrl
  ) {
    reportExportIssue('portrait-stale');
    throw new PortraitError();
  }

  const objectPosition = parseObjectPosition(
    window.getComputedStyle(image).objectPosition,
  );
  if (
    !objectPosition ||
    Math.abs(objectPosition[0] - photo.positionX) > 0.01 ||
    Math.abs(objectPosition[1] - photo.positionY) > 0.01
  ) {
    reportExportIssue('portrait-stale');
    throw new PortraitError();
  }

  try {
    await withTimeout(
      image.decode(),
      PORTRAIT_DECODE_TIMEOUT_MS,
      new PortraitError(),
    );
  } catch {
    reportExportIssue('portrait-decode');
    throw new PortraitError();
  }

  if (
    !image.complete ||
    image.naturalWidth <= 0 ||
    image.naturalHeight <= 0 ||
    image.naturalWidth !== photo.width ||
    image.naturalHeight !== photo.height
  ) {
    reportExportIssue('portrait-decode');
    throw new PortraitError();
  }

  const nodeRect = node.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  if (
    nodeRect.width <= 0 ||
    nodeRect.height <= 0 ||
    imageRect.width <= 0 ||
    imageRect.height <= 0
  ) {
    reportExportIssue('portrait-missing');
    throw new PortraitError();
  }

  const scaleX = FLYER_WIDTH / nodeRect.width;
  const scaleY = FLYER_HEIGHT / nodeRect.height;
  const box: FlyerBox = {
    left: (imageRect.left - nodeRect.left) * scaleX,
    top: (imageRect.top - nodeRect.top) * scaleY,
    width: imageRect.width * scaleX,
    height: imageRect.height * scaleY,
  };
  const sampleSize = Math.min(
    PORTRAIT_SAMPLE_SIZE,
    box.width,
    box.height,
  );
  const sample: FlyerBox = {
    left: box.left + (box.width - sampleSize) / 2,
    top: box.top + (box.height - sampleSize) / 2,
    width: sampleSize,
    height: sampleSize,
  };

  return {
    objectUrl: photo.objectUrl,
    width: photo.width,
    height: photo.height,
    positionX: photo.positionX,
    positionY: photo.positionY,
    box,
    sample,
  };
}

export async function verifyPortraitInPng(
  blob: Blob,
  snapshot: PortraitSnapshot,
  scale: ExportScale,
): Promise<boolean> {
  let actualUrl: string | null = null;

  try {
    actualUrl = URL.createObjectURL(blob);
    const actualImage = await loadImage(actualUrl);
    if (
      actualImage.naturalWidth !== FLYER_WIDTH * scale ||
      actualImage.naturalHeight !== FLYER_HEIGHT * scale
    ) {
      reportExportIssue('portrait-verify-size');
      return false;
    }

    const expectedImage = await loadImage(snapshot.objectUrl);
    if (
      expectedImage.naturalWidth !== snapshot.width ||
      expectedImage.naturalHeight !== snapshot.height
    ) {
      reportExportIssue('portrait-verify-source');
      return false;
    }

    const patchWidth = Math.max(1, Math.round(snapshot.sample.width * scale));
    const patchHeight = Math.max(1, Math.round(snapshot.sample.height * scale));

    const actualCanvas = document.createElement('canvas');
    actualCanvas.width = patchWidth;
    actualCanvas.height = patchHeight;
    const actualContext = actualCanvas.getContext('2d');
    if (!actualContext) return false;
    actualContext.drawImage(
      actualImage,
      snapshot.sample.left * scale,
      snapshot.sample.top * scale,
      snapshot.sample.width * scale,
      snapshot.sample.height * scale,
      0,
      0,
      patchWidth,
      patchHeight,
    );
    const actualPixels = actualContext.getImageData(
      0,
      0,
      patchWidth,
      patchHeight,
    ).data;

    const sourceRect = calculateCoverSourceRect(
      snapshot.width,
      snapshot.height,
      snapshot.box.width,
      snapshot.box.height,
      snapshot.positionX,
      snapshot.positionY,
    );
    const sampleOffsetX = snapshot.sample.left - snapshot.box.left;
    const sampleOffsetY = snapshot.sample.top - snapshot.box.top;
    const sourceX =
      sourceRect.x + (sampleOffsetX / snapshot.box.width) * sourceRect.width;
    const sourceY =
      sourceRect.y + (sampleOffsetY / snapshot.box.height) * sourceRect.height;
    const sourceWidth =
      (snapshot.sample.width / snapshot.box.width) * sourceRect.width;
    const sourceHeight =
      (snapshot.sample.height / snapshot.box.height) * sourceRect.height;

    const expectedCanvas = document.createElement('canvas');
    expectedCanvas.width = patchWidth;
    expectedCanvas.height = patchHeight;
    const expectedContext = expectedCanvas.getContext('2d');
    if (!expectedContext) return false;
    expectedContext.drawImage(
      expectedImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      patchWidth,
      patchHeight,
    );
    const expectedPixels = expectedContext.getImageData(
      0,
      0,
      patchWidth,
      patchHeight,
    ).data;

    const comparison = comparePatchPixels(expectedPixels, actualPixels);
    if (!isPortraitPatchAcceptable(comparison, actualPixels)) {
      reportExportIssue('portrait-verify');
      return false;
    }

    return true;
  } catch {
    reportExportIssue('portrait-verify-load');
    return false;
  } finally {
    if (actualUrl) URL.revokeObjectURL(actualUrl);
  }
}
