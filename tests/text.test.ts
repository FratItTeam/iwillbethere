import { describe, expect, it } from 'vitest';
import {
  countEmoji,
  countGraphemes,
  splitGraphemes,
  validateFirstName,
  validateMessage,
} from '../src/lib/text';

describe('grapheme helpers', () => {
  it('counts combining marks as part of one character', () => {
    expect(splitGraphemes('e\u0301')).toEqual(['e\u0301']);
    expect(countGraphemes('e\u0301')).toBe(1);
  });

  it('counts emoji sequences as one grapheme', () => {
    expect(countGraphemes('👨‍👩‍👧‍👦')).toBe(1);
    expect(countGraphemes('🇷🇼')).toBe(1);
    expect(countGraphemes('1️⃣')).toBe(1);
  });

  it('counts emoji clusters, including joined and keycap sequences', () => {
    expect(countEmoji('Jean😊')).toBe(1);
    expect(countEmoji('👨‍👩‍👧‍👦')).toBe(1);
    expect(countEmoji('🇷🇼')).toBe(1);
    expect(countEmoji('1️⃣')).toBe(1);
    expect(countEmoji('JeanClaude')).toBe(0);
  });
});

describe('validateFirstName', () => {
  it.each(['', '   ', 'First Name', 'first name'])(
    'rejects a blank or placeholder name: %s',
    (value) => {
      expect(validateFirstName(value)).not.toBeNull();
    },
  );

  it('accepts ten user-perceived characters', () => {
    expect(validateFirstName('JeanClaude')).toBeNull();
    expect(validateFirstName('A'.repeat(10))).toBeNull();
  });

  it('rejects eleven user-perceived characters', () => {
    expect(validateFirstName('A'.repeat(11))).toBe('Use 10 characters or fewer.');
  });

  it('accepts one emoji within the ten-character limit', () => {
    expect(validateFirstName('JeanClaud😊')).toBeNull();
  });

  it('rejects more than one emoji', () => {
    expect(validateFirstName('Jean😊🥳')).toBe('Use only one emoji in your name.');
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateFirstName('  Aline  ')).toBeNull();
  });
});

describe('message length validation', () => {
  it('allows one hundred fifty message characters and rejects more', () => {
    expect(validateMessage('A'.repeat(150))).toBeNull();
    expect(validateMessage('A'.repeat(151))).toBe(
      'Keep your message to 150 characters or fewer.',
    );
  });

  it('counts emoji as one user-perceived character', () => {
    expect(validateMessage('😊'.repeat(150))).toBeNull();
    expect(validateMessage('😊'.repeat(151))).not.toBeNull();
  });
});
