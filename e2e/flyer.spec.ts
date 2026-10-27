import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const PORTRAIT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGN8rlPBgA0wYRUdtBIAOQgBm4GLYfcAAAAASUVORK5CYII=',
  'base64',
);

function pngSize(buffer: Buffer): { width: number; height: number } {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test('customizes the flyer live and switches palette and size', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your flyer' })).toBeVisible();

  await page.getByLabel('First name').fill('Aline');
  await expect(page.locator('.fit-heading .fit-text__inner')).toHaveText(
    'I, Aline, will be There!',
  );

  await page.getByText('Midnight', { exact: true }).click();
  await expect
    .poll(() =>
      page.locator('.flyer').evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--flyer-ink').trim(),
      ),
    )
    .toBe('#1E2B4F');

  await page.getByText('3×', { exact: true }).click();
  await expect(page.getByRole('button', { name: /Download my flyer/i })).toContainText(
    '3240 × 4050',
  );

  expect(pageErrors).toEqual([]);
});

test('uploads a photo and downloads a PNG with the requested dimensions', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('First name').fill('Jean Claude');
  await page.locator('#photo-upload').setInputFiles({
    name: 'portrait.png',
    mimeType: 'image/png',
    buffer: PORTRAIT_PNG,
  });

  await expect(page.getByText('Photo ready')).toBeVisible();
  await expect(page.locator('.flyer__photo')).toBeVisible();

  await page.getByText('2×', { exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download my flyer/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('frat-day-jean-claude.png');
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const buffer = await readFile(downloadPath as string);

  expect(buffer.subarray(1, 4).toString()).toBe('PNG');
  expect(pngSize(buffer)).toEqual({ width: 2160, height: 2700 });
  await expect(page.getByRole('status')).toContainText('2160 × 2700');
});

test('blocks export without a first name and supports starting over', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('First name').fill('Josiane');
  await page.getByLabel('First name').fill('');

  await page.getByRole('button', { name: /Download my flyer/i }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Add your first name before downloading.',
  );

  await page.getByLabel('First name').fill('Josiane');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Start over' }).click();

  await expect(page.getByLabel('First name')).toHaveValue('First Name');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
