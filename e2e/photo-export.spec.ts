import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe.configure({ timeout: 120_000 });

interface PortraitImage {
  buffer: Buffer;
  name: string;
  mimeType: string;
}

interface SampleBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Rgb {
  red: number;
  green: number;
  blue: number;
}

type PortraitPattern = 'red' | 'green' | 'split' | 'detailed';

function pngSize(buffer: Buffer): { width: number; height: number } {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function createPortraitImage(
  page: Page,
  pattern: PortraitPattern,
  width = 800,
  height = 400,
  mimeType = 'image/png',
): Promise<PortraitImage> {
  const dataUrl = await page.evaluate(
    ({ pattern, width, height, mimeType }) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context is unavailable.');

      context.fillStyle = pattern === 'green' ? '#00ff00' : '#ff0000';
      context.fillRect(0, 0, width, height);

      if (pattern === 'split') {
        context.fillStyle = '#0000ff';
        context.fillRect(width / 2, 0, width / 2, height);
      }

      if (pattern === 'detailed') {
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1d3557');
        gradient.addColorStop(0.5, '#e63946');
        gradient.addColorStop(1, '#f1faee');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        for (let index = 0; index < 36; index += 1) {
          const x = ((index * 137) % width) + 40;
          const y = ((index * 89) % height) + 40;
          const radius = 18 + (index % 7) * 9;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle =
            index % 2 === 0 ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.55)';
          context.fill();
        }

        context.strokeStyle = 'rgba(255,255,255,0.7)';
        context.lineWidth = 3;
        for (let x = 0; x < width; x += 24) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x + 80, height);
          context.stroke();
        }
      }

      return canvas.toDataURL(mimeType, mimeType === 'image/jpeg' ? 0.9 : undefined);
    },
    { pattern, width, height, mimeType },
  );

  const encoded = dataUrl.split(',')[1];
  if (!encoded) throw new Error('The test image could not be generated.');

  return {
    buffer: Buffer.from(encoded, 'base64'),
    name: `portrait.${mimeType === 'image/jpeg' ? 'jpg' : 'png'}`,
    mimeType,
  };
}

async function uploadPortrait(
  page: Page,
  image: PortraitImage,
): Promise<string> {
  await page.locator('#photo-upload').setInputFiles({
    name: image.name,
    mimeType: image.mimeType,
    buffer: image.buffer,
  });
  await expect(page.getByText('Photo ready')).toBeVisible();
  await expect(page.locator('.photo-current__thumb')).toHaveAttribute(
    'src',
    /^blob:/,
  );
  await expect(
    page.getByRole('button', { name: /Download My Flyer/i }),
  ).toBeEnabled();

  const src = await page.locator('.photo-current__thumb').getAttribute('src');
  if (!src) throw new Error('The photo preview has no source.');
  return src;
}

async function fillName(page: Page, name = 'Aline'): Promise<void> {
  await page.getByLabel('Your First Name').fill(name);
}

async function selectScale(page: Page, scale: 1 | 2 | 3): Promise<void> {
  await page.getByText(`${scale}×`, { exact: true }).click();
  await expect(
    page.getByRole('button', { name: /Download My Flyer/i }),
  ).toContainText(`${1080 * scale} × ${1350 * scale}`);
}

async function downloadFlyer(page: Page): Promise<Buffer> {
  const button = page.getByRole('button', { name: /Download My Flyer/i });
  await expect(button).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await button.click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error('The download did not produce a local file.');
  const buffer = await readFile(path);

  await expect(button).toBeEnabled();
  return buffer;
}

async function getPortraitSample(page: Page): Promise<SampleBox> {
  return page.evaluate(() => {
    const flyer = document.querySelector('.flyer');
    const image = document.querySelector('.flyer__photo');
    if (!(flyer instanceof HTMLElement) || !(image instanceof HTMLImageElement)) {
      throw new Error('The flyer portrait is unavailable.');
    }

    const flyerRect = flyer.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    if (!flyerRect.width || !flyerRect.height || !imageRect.width || !imageRect.height) {
      throw new Error('The flyer portrait has no layout size.');
    }

    const scaleX = 1080 / flyerRect.width;
    const scaleY = 1350 / flyerRect.height;
    const box = {
      left: (imageRect.left - flyerRect.left) * scaleX,
      top: (imageRect.top - flyerRect.top) * scaleY,
      width: imageRect.width * scaleX,
      height: imageRect.height * scaleY,
    };
    const size = Math.min(200, box.width, box.height);

    return {
      left: box.left + (box.width - size) / 2,
      top: box.top + (box.height - size) / 2,
      width: size,
      height: size,
    };
  });
}

async function inspectPortrait(
  page: Page,
  buffer: Buffer,
  sample: SampleBox,
  scale: number,
): Promise<Rgb> {
  return page.evaluate(
    async ({ dataUrl, sample, scale }) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();

      const width = Math.max(1, Math.round(sample.width * scale));
      const height = Math.max(1, Math.round(sample.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context is unavailable.');

      context.drawImage(
        image,
        sample.left * scale,
        sample.top * scale,
        sample.width * scale,
        sample.height * scale,
        0,
        0,
        width,
        height,
      );

      const { data } = context.getImageData(0, 0, width, height);
      let red = 0;
      let green = 0;
      let blue = 0;
      let pixels = 0;

      for (let index = 0; index < data.length; index += 4) {
        red += data[index] ?? 0;
        green += data[index + 1] ?? 0;
        blue += data[index + 2] ?? 0;
        pixels += 1;
      }

      return {
        red: red / pixels,
        green: green / pixels,
        blue: blue / pixels,
      };
    },
    {
      dataUrl: `data:image/png;base64,${buffer.toString('base64')}`,
      sample,
      scale,
    },
  );
}

async function setHorizontalPosition(
  page: Page,
  value: number,
): Promise<void> {
  const slider = page.locator('.range-field input').first();
  await slider.evaluate((node, nextValue) => {
    const input = node as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('The range value setter is unavailable.');
    setter.call(input, String(nextValue));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);

  await expect(slider).toHaveValue(String(value));
  await expect
    .poll(() =>
      page
        .locator('.flyer__photo')
        .evaluate((node) => (node as HTMLImageElement).style.objectPosition),
    )
    .toBe(`${value}% 50%`);
}

test('includes the selected portrait at every export scale', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await fillName(page);
  const portrait = await createPortraitImage(page, 'red');
  await uploadPortrait(page, portrait);
  const sample = await getPortraitSample(page);

  for (const scale of [1, 2, 3] as const) {
    await selectScale(page, scale);
    const buffer = await downloadFlyer(page);

    expect(buffer.subarray(1, 4).toString()).toBe('PNG');
    expect(pngSize(buffer)).toEqual({
      width: 1080 * scale,
      height: 1350 * scale,
    });

    const color = await inspectPortrait(page, buffer, sample, scale);
    expect(color.red).toBeGreaterThan(200);
    expect(color.green).toBeLessThan(80);
    expect(color.blue).toBeLessThan(80);
  }

  await expect(page.locator('.toast--error')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('uses a replacement portrait and revokes the previous object URL', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalRevoke = URL.revokeObjectURL.bind(URL);
    const target = window as Window & { __revokedPhotoUrls?: string[] };
    target.__revokedPhotoUrls = [];
    URL.revokeObjectURL = (url: string) => {
      target.__revokedPhotoUrls?.push(url);
      originalRevoke(url);
    };
  });

  await page.goto('/');
  await fillName(page);

  const redPortrait = await createPortraitImage(page, 'red');
  const redUrl = await uploadPortrait(page, redPortrait);
  const greenPortrait = await createPortraitImage(page, 'green');
  const greenUrl = await uploadPortrait(page, greenPortrait);

  await expect
    .poll(() =>
      page.locator('.photo-current__thumb').getAttribute('src'),
    )
    .toBe(greenUrl);
  expect(greenUrl).not.toBe(redUrl);

  await expect
    .poll(() =>
      page.evaluate((url) => {
        const target = window as Window & { __revokedPhotoUrls?: string[] };
        return target.__revokedPhotoUrls?.includes(url) ?? false;
      }, redUrl),
    )
    .toBe(true);

  await selectScale(page, 1);
  const sample = await getPortraitSample(page);
  const buffer = await downloadFlyer(page);
  const color = await inspectPortrait(page, buffer, sample, 1);

  expect(color.green).toBeGreaterThan(200);
  expect(color.red).toBeLessThan(80);
  expect(color.blue).toBeLessThan(80);
});

test('exports the photo region selected by the crop controls', async ({ page }) => {
  await page.goto('/');
  await fillName(page);
  const portrait = await createPortraitImage(page, 'split');
  await uploadPortrait(page, portrait);
  await selectScale(page, 1);
  const sample = await getPortraitSample(page);

  await setHorizontalPosition(page, 0);
  const leftBuffer = await downloadFlyer(page);
  const leftColor = await inspectPortrait(page, leftBuffer, sample, 1);
  expect(leftColor.red).toBeGreaterThan(200);
  expect(leftColor.blue).toBeLessThan(80);

  await setHorizontalPosition(page, 100);
  const rightBuffer = await downloadFlyer(page);
  const rightColor = await inspectPortrait(page, rightBuffer, sample, 1);
  expect(rightColor.blue).toBeGreaterThan(200);
  expect(rightColor.red).toBeLessThan(80);
});

test('includes a large JPEG portrait in the export', async ({ page }) => {
  await page.goto('/');
  await fillName(page);
  const portrait = await createPortraitImage(
    page,
    'red',
    3000,
    2000,
    'image/jpeg',
  );
  await uploadPortrait(page, portrait);
  await selectScale(page, 1);
  const sample = await getPortraitSample(page);

  const buffer = await downloadFlyer(page);
  expect(pngSize(buffer)).toEqual({ width: 1080, height: 1350 });

  const color = await inspectPortrait(page, buffer, sample, 1);
  expect(color.red).toBeGreaterThan(200);
  expect(color.green).toBeLessThan(80);
  expect(color.blue).toBeLessThan(80);
});

test('exports a detailed JPEG portrait at maximum scale', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await fillName(page);
  const portrait = await createPortraitImage(
    page,
    'detailed',
    1200,
    800,
    'image/jpeg',
  );
  await uploadPortrait(page, portrait);
  await selectScale(page, 3);

  const buffer = await downloadFlyer(page);
  expect(pngSize(buffer)).toEqual({ width: 3240, height: 4050 });
  await expect(page.locator('.toast--success')).toContainText('3240 × 4050');
  expect(pageErrors).toEqual([]);
});

test('rejects a corrupt image without creating a photo or download', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await fillName(page);
  await page.locator('#photo-upload').setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('This is not an image.'),
  });

  await expect(page.locator('.photo-panel__error')).toContainText(
    'That image file could not be opened.',
  );
  await expect(page.getByText('Photo ready')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Download My Flyer/i }),
  ).toBeDisabled();
  expect(pageErrors).toEqual([]);
});

test('does not download a PNG whose portrait is missing', async ({ page }) => {
  await page.goto('/');
  await fillName(page);
  const portrait = await createPortraitImage(page, 'red');
  await uploadPortrait(page, portrait);
  await selectScale(page, 1);

  const downloads: string[] = [];
  page.on('download', (download) => downloads.push(download.suggestedFilename()));

  await page.evaluate(() => {
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (
      this: HTMLCanvasElement,
      callback: BlobCallback,
      type?: string,
      quality?: number,
    ) {
      const blank = document.createElement('canvas');
      blank.width = this.width;
      blank.height = this.height;
      const context = blank.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, blank.width, blank.height);
      }
      originalToBlob.call(blank, callback, type, quality);
    };
  });

  const button = page.getByRole('button', { name: /Download My Flyer/i });
  await button.click();

  await expect(page.locator('.toast--error')).toContainText(
    "We couldn't include your photo in the flyer. Please try again or choose your photo again.",
    { timeout: 30_000 },
  );
  await expect(button).toBeEnabled();
  await page.waitForTimeout(250);
  expect(downloads).toHaveLength(0);
});

test('creates only one download when export is clicked twice', async ({
  page,
}) => {
  await page.goto('/');
  await fillName(page);
  const portrait = await createPortraitImage(page, 'red');
  await uploadPortrait(page, portrait);

  const downloads: string[] = [];
  page.on('download', (download) => downloads.push(download.suggestedFilename()));

  await page
    .getByRole('button', { name: /Download My Flyer/i })
    .evaluate((node) => {
      node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

  await expect(page.locator('.toast--success')).toBeVisible();
  await page.waitForTimeout(250);
  expect(downloads).toHaveLength(1);
});
