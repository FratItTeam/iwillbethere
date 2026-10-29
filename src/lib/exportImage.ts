import { toBlob } from 'html-to-image';
import { UI_COPY } from '../data/copy';
import type { ExportScale, PhotoSelection } from '../types';
import {
  FLYER_HEIGHT,
  FLYER_WIDTH,
  PortraitError,
  preparePortrait,
  reportExportIssue,
  verifyPortraitInPng,
} from './portrait';

const FONT_FACES = [
  '400 16px Montserrat',
  '500 16px Montserrat',
  '600 16px Montserrat',
  '700 16px Montserrat',
  '800 16px Montserrat',
  '400 16px Anton',
  '500 16px "Playfair Display"',
  '900 16px "Playfair Display"',
];

const EXPORT_TIMEOUT_MS = 30_000;
const MAX_EXPORT_ATTEMPTS = 2;

async function waitForFonts(): Promise<void> {
  if (!document.fonts) return;

  await Promise.allSettled(FONT_FACES.map((font) => document.fonts.load(font)));
  await document.fonts.ready;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
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

export async function createFlyerPng(
  node: HTMLElement,
  scale: ExportScale,
  photo: PhotoSelection,
): Promise<{ blob: Blob; width: number; height: number }> {
  await waitForFonts();

  for (let attempt = 0; attempt < MAX_EXPORT_ATTEMPTS; attempt += 1) {
    try {
      await nextFrame();
      const snapshot = await preparePortrait(node, photo);

      let blob: Blob | null;
      try {
        blob = await withTimeout(
          toBlob(node, {
            width: FLYER_WIDTH,
            height: FLYER_HEIGHT,
            pixelRatio: scale,
            backgroundColor: '#ffffff',
            cacheBust: false,
            skipAutoScale: true,
            style: {
              transform: 'none',
              transformOrigin: 'top left',
              margin: '0',
            },
          }),
          EXPORT_TIMEOUT_MS,
          new Error(UI_COPY.export.genericError),
        );
      } catch (error) {
        reportExportIssue('generation');
        throw error instanceof Error
          ? error
          : new Error(UI_COPY.export.genericError);
      }

      if (!blob) {
        reportExportIssue('generation');
        throw new Error(UI_COPY.export.genericError);
      }

      if (await verifyPortraitInPng(blob, snapshot, scale)) {
        return {
          blob,
          width: FLYER_WIDTH * scale,
          height: FLYER_HEIGHT * scale,
        };
      }
    } catch (error) {
      if (!(error instanceof PortraitError)) throw error;
    }
  }

  reportExportIssue('portrait-verify-exhausted');
  throw new PortraitError();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 15_000);
}
