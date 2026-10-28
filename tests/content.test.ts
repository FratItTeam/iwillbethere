import { describe, expect, it } from 'vitest';
import { buildHeadline, personalizeHeading } from '../src/lib/content';

describe('personalizeHeading', () => {
  it('replaces every name placeholder', () => {
    expect(personalizeHeading('[First Name] and [First Name]', 'Aline')).toBe(
      'Aline and Aline',
    );
  });

  it('leaves the heading unchanged when there is no placeholder', () => {
    expect(personalizeHeading('I will be There!', 'Aline')).toBe('I will be There!');
  });

  it('supports empty and punctuation-heavy names', () => {
    expect(personalizeHeading('I, [First Name], will be There!', "Anne-Marie O'Neil")).toBe(
      "I, Anne-Marie O'Neil, will be There!",
    );
  });
});

describe('buildHeadline', () => {
  it('builds the locked headline', () => {
    expect(buildHeadline('Aline', '')).toBe('I, Aline, will be There!');
  });

  it('trims the name and falls back when it is empty', () => {
    expect(buildHeadline('  Aline  ', '')).toBe('I, Aline, will be There!');
    expect(buildHeadline('   ', '')).toBe('I, First Name, will be There!');
  });

  it('inserts one emoji immediately before the final exclamation mark', () => {
    expect(buildHeadline('Jean', '😊')).toBe('I, Jean, will be There😊!');
  });

  it('does not add a space before the emoji', () => {
    expect(buildHeadline('Aline', '🎉')).not.toContain(' 🎉');
  });
});
