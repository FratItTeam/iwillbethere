import { describe, expect, it } from 'vitest';
import { buildPngFilename, slugifyName } from '../src/lib/filename';

describe('slugifyName', () => {
  it('lowercases and hyphenates names', () => {
    expect(slugifyName('Jean Claude')).toBe('jean-claude');
  });

  it('removes accents and punctuation', () => {
    expect(slugifyName('  Élodie O’Connor  ')).toBe('elodie-oconnor');
  });

  it('collapses repeated separators', () => {
    expect(slugifyName('A---B__C')).toBe('a-b-c');
  });

  it('limits slugs to 48 characters', () => {
    expect(slugifyName('a'.repeat(80))).toHaveLength(48);
  });

  it('falls back when nothing usable remains', () => {
    expect(slugifyName('!!!')).toBe('flyer');
  });
});

describe('buildPngFilename', () => {
  it('creates a descriptive download filename', () => {
    expect(buildPngFilename('Jean')).toBe('frat-day-jean.png');
  });

  it('works with accented names', () => {
    expect(buildPngFilename('Françoise')).toBe('frat-day-francoise.png');
  });
});
