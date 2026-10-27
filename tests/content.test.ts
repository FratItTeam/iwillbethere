import { describe, expect, it } from 'vitest';
import { personalizeHeading } from '../src/lib/content';

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
