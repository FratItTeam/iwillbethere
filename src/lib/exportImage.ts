import { toBlob } from 'html-to-image';
import type { ExportScale } from '../types';

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

async function waitForFonts(): Promise<void> {
  if (!document.fonts) return;

  await Promise.allSettled(FONT_FACES.map((font) => document.fonts.load(font)));
  await document.fonts.ready;
}

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      try {
        await image.decode();
      } catch {
        // The export can still proceed with the rest of the flyer.
      }
    }),
  );
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function createFlyerPng(
  node: HTMLElement,
  scale: ExportScale,
): Promise<{ blob: Blob; width: number; height: number }> {
  await waitForFonts();
  await waitForImages(node);
  await nextFrame();

  const blob = await toBlob(node, {
    width: 1080,
    height: 1350,
    pixelRatio: scale,
    backgroundColor: '#ffffff',
    cacheBust: true,
    skipAutoScale: true,
    style: {
      transform: 'none',
      transformOrigin: 'top left',
      margin: '0',
    },
  });

  if (!blob) {
    throw new Error('The flyer image could not be created. Please try again.');
  }

  return { blob, width: 1080 * scale, height: 1350 * scale };
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
