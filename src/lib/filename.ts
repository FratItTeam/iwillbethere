export function slugifyName(value: string): string {
  const slug = value
    .replace(/['’]/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return slug || 'flyer';
}

export function buildPngFilename(firstName: string): string {
  return `frat-day-${slugifyName(firstName)}.png`;
}
