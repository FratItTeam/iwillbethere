import { expect, test, type Page } from '@playwright/test';
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

async function uploadPortrait(page: Page, name = 'portrait.png'): Promise<void> {
  await page.locator('#photo-upload').setInputFiles({
    name,
    mimeType: 'image/png',
    buffer: PORTRAIT_PNG,
  });
  await expect(page.getByText('Photo ready')).toBeVisible();
}

async function fillValidNameAndPhoto(page: Page, name = 'Aline'): Promise<void> {
  await page.getByLabel('Your First Name').fill(name);
  await uploadPortrait(page);
}

test('requires a valid name and photo before download', async ({ page }) => {
  await page.goto('/');

  const download = page.getByRole('button', { name: /Download My Flyer/i });
  const readiness = page.locator('#export-readiness');

  await expect(download).toBeDisabled();
  await expect(readiness).toContainText('Add your first name and photo');
  await expect(page.getByText('Download Your Flyer').first()).toBeVisible();
  await expect(page.getByText('Add Your Photo').first()).toBeVisible();
  await expect(
    page.getByText('Your PNG will be saved using your first name.'),
  ).toBeVisible();

  await page.getByLabel('Your First Name').fill('Aline');
  await expect(download).toBeDisabled();
  await expect(readiness).toContainText('Add your photo');
  await expect(page.getByText('frat-day-aline.png')).toBeVisible();

  await uploadPortrait(page);
  await expect(download).toBeEnabled();
  await expect(readiness).toContainText('Your name and photo are set');

  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(download).toBeDisabled();
  await expect(readiness).toContainText('Add your photo');
});

test('rejects invalid names without deleting already valid text', async ({ page }) => {
  await page.goto('/');

  const name = page.getByLabel('Your First Name');
  const nameError = page.locator('#firstName-error');
  const validTen = 'A'.repeat(10);

  await name.fill(validTen);
  await expect(name).toHaveValue(validTen);
  await expect(page.locator('#firstName-counter')).toHaveText('10 / 10');

  await name.press('B');
  await expect(name).toHaveValue(validTen);
  await expect(nameError).toContainText('Use 10 characters or fewer.');

  await name.fill('Jean😊🥳');
  await expect(name).toHaveValue(validTen);
  await expect(nameError).toContainText('Use only one emoji in your name.');

  await name.fill('First Name');
  await name.blur();
  await expect(nameError).toContainText('Replace “First Name” with your own name.');

  await name.fill('Jean😊');
  await expect(name).toHaveValue('Jean😊');
  await expect(page.locator('#firstName-counter')).toHaveText('5 / 10');
  await expect(nameError).toHaveCount(0);
});

test('adds, replaces and removes one headline emoji outside the flyer', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await page.getByLabel('Your First Name').fill('Aline');

  const headline = page.locator('.fit-heading .fit-text__inner');
  const trigger = page.getByRole('button', {
    name: 'Add an emoji to your headline',
  });

  await expect(headline).toHaveText('I, Aline, will be There!');
  await expect(page.locator('#headingTemplate')).toHaveCount(0);
  await expect(page.locator('.flyer button')).toHaveCount(0);

  await trigger.click();
  await expect(
    page.getByRole('dialog', { name: 'Choose an emoji' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Use 🥳 in your headline/i }).click();
  await expect(headline).toHaveText('I, Aline, will be There🥳!');

  await trigger.click();
  await page.getByRole('button', { name: /Use 😊 in your headline/i }).click();
  await expect(headline).toHaveText('I, Aline, will be There😊!');

  await trigger.click();
  await page.getByRole('button', { name: 'No emoji', exact: true }).click();
  await expect(headline).toHaveText('I, Aline, will be There!');

  await expect(page.locator('.flyer .emoji-picker')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('keeps official details locked and refreshes the Kigali countdown', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-30T21:58:00Z') });
  await page.goto('/');

  const countdown = page.locator('.fit-countdown .fit-text__inner');
  await expect(countdown).toHaveText('1 DAY TO GO');

  await expect(
    page.locator(
      '#eventDate, #arrivalTime, #venue, #headingTemplate, #statusLine, input[name="statusLine"], input[name="theme"]',
    ),
  ).toHaveCount(0);
  await expect(page.getByText('Flyer wording', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Color story', { exact: true })).toHaveCount(0);

  const flyer = page.locator('.flyer');
  await expect(flyer.locator('.fit-status .fit-text__inner')).toHaveText(
    'Definitely not Missing This!!!!',
  );
  await expect(flyer.locator('.fit-weekday .fit-text__inner')).toHaveText(
    'SATURDAY / KU WA GATANDATU',
  );
  await expect(flyer.locator('.fit-date .fit-text__inner')).toHaveText(
    '31 OCTOBER 2026',
  );
  await expect(flyer.locator('.fit-arrival .fit-text__inner')).toHaveText(
    'Arrival Time: 13H00',
  );
  await expect(flyer.locator('.fit-venue .fit-text__inner')).toHaveText(
    'Saint Ignatius, Kibagabaga',
  );

  const ink = await flyer.evaluate((node) =>
    getComputedStyle(node).getPropertyValue('--flyer-ink').trim(),
  );
  expect(ink).toBe('#6E1637');

  await page.clock.fastForward(3 * 60 * 1000);
  await expect(countdown).toHaveText("IT'S TODAY!");
});

test('limits text and keeps the measured message above the countdown', async ({
  page,
}) => {
  await page.goto('/');

  const message = page.getByLabel('Your Message');
  const longMessage = 'W'.repeat(150);
  await message.fill(longMessage);

  await expect(page.locator('#message-counter')).toHaveText('150 / 150');
  await expect(page.locator('.flyer__message-label')).toHaveText('The Message');

  const messageText = page.locator('.flyer__message-text');
  await expect(messageText).toHaveText(longMessage);
  await expect
    .poll(async () => Number(await messageText.getAttribute('data-lines')))
    .toBeGreaterThanOrEqual(3);

  const textStyle = await messageText.evaluate((node) => {
    const style = getComputedStyle(node);
    return { fontSize: style.fontSize, lineHeight: style.lineHeight };
  });
  expect(textStyle).toEqual({ fontSize: '20px', lineHeight: '30px' });

  const textBox = await messageText.boundingBox();
  const countdownBox = await page.locator('.flyer__countdown-wrap').boundingBox();
  expect(textBox).not.toBeNull();
  expect(countdownBox).not.toBeNull();
  expect((textBox?.y ?? 0) + (textBox?.height ?? 0)).toBeLessThan(
    countdownBox?.y ?? 0,
  );

  await message.fill('A'.repeat(150));
  await message.press('B');
  await expect(message).toHaveValue('A'.repeat(150));
  await expect(page.locator('#message-error')).toContainText(
    'Keep your message to 150 characters or fewer.',
  );
});

test('downloads a valid PNG at the selected scale', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await fillValidNameAndPhoto(page);

  await page.getByText('3×', { exact: true }).click();
  const downloadButton = page.getByRole('button', { name: /Download My Flyer/i });
  await expect(downloadButton).toContainText('3240 × 4050');

  await page.getByText('2×', { exact: true }).click();
  await expect(downloadButton).toContainText('2160 × 2700');

  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('frat-day-aline.png');
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const buffer = await readFile(downloadPath as string);

  expect(buffer.subarray(1, 4).toString()).toBe('PNG');
  expect(pngSize(buffer)).toEqual({ width: 2160, height: 2700 });
  await expect(page.locator('.toast')).toContainText('2160 × 2700');
  await expect(page.locator('.toast')).toContainText("you’ll be there");
  expect(pageErrors).toEqual([]);
});

test('revalidates missing photo inside the export handler', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your First Name').fill('Aline');

  const download = page.getByRole('button', { name: /Download My Flyer/i });
  await expect(page.locator('#export-readiness')).toContainText('Add your photo');
  await expect(download).toBeDisabled();
  await download.evaluate((node) => {
    const propsKey = Object.keys(node).find((key) => key.startsWith('__reactProps$'));
    const props = propsKey
      ? (node as unknown as Record<string, { onClick?: () => void }>)[propsKey]
      : undefined;
    props?.onClick?.();
  });

  await expect(page.locator('.toast')).toContainText(
    'Add your photo before downloading.',
  );
  await expect(page.locator('#photo-upload-trigger')).toBeFocused();
});

test('uses form, preview, download order on mobile without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const formBox = await page.locator('#editor').boundingBox();
  const previewBox = await page.locator('.preview-column').boundingBox();
  const downloadBox = await page.locator('#download').boundingBox();

  expect(formBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(downloadBox).not.toBeNull();
  expect(formBox?.y ?? 0).toBeLessThan(previewBox?.y ?? 0);
  expect(previewBox?.y ?? 0).toBeLessThan(downloadBox?.y ?? 0);

  const hasNoHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(hasNoHorizontalOverflow).toBe(true);
});

test('keeps preview and form side by side on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  const formBox = await page.locator('.form-column').boundingBox();
  const previewBox = await page.locator('.preview-column').boundingBox();

  expect(formBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(previewBox?.x ?? 0).toBeLessThan(formBox?.x ?? 0);
  expect(Math.abs((previewBox?.y ?? 0) - (formBox?.y ?? 0))).toBeLessThan(80);
});

test('starts over without retaining personal content', async ({ page }) => {
  await page.goto('/');
  await fillValidNameAndPhoto(page, 'Aline');

  await page.getByRole('button', { name: 'Add an emoji to your headline' }).click();
  await page.getByRole('button', { name: /Use 🎉 in your headline/i }).click();
  await page.getByLabel('Your Message').fill('See you soon!');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Start over' }).click();

  await expect(page.getByLabel('Your First Name')).toHaveValue('First Name');
  await expect(page.getByText('Photo ready')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add Your Photo' })).toBeVisible();
  await expect(page.locator('.fit-heading .fit-text__inner')).toHaveText(
    'I, First Name, will be There!',
  );
  await expect(page.locator('#message')).toHaveValue(
    "Ready for the day! Can't wait to see you all!",
  );
  await expect(page.locator('.fit-status .fit-text__inner')).toHaveText(
    'Definitely not Missing This!!!!',
  );
  await expect(page.getByRole('button', { name: /Download My Flyer/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Download My Flyer/i })).toHaveCount(1);
});
