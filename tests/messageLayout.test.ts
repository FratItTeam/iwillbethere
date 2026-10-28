import { describe, expect, it } from 'vitest';
import {
  getMessageShiftLines,
  getMessageShiftPixels,
  getRenderedLineCount,
} from '../src/lib/messageLayout';

describe('message layout helpers', () => {
  it('does not shift a single-line message', () => {
    expect(getMessageShiftLines(1)).toBe(0);
    expect(getMessageShiftPixels(1)).toBe(0);
  });

  it('shifts one line per additional rendered line', () => {
    expect(getMessageShiftLines(2)).toBe(1);
    expect(getMessageShiftPixels(2)).toBe(-30);
    expect(getMessageShiftLines(3)).toBe(2);
    expect(getMessageShiftPixels(3)).toBe(-60);
  });

  it('clamps the shift to two line heights', () => {
    expect(getMessageShiftLines(4)).toBe(2);
    expect(getMessageShiftPixels(4)).toBe(-60);
    expect(getMessageShiftLines(10)).toBe(2);
  });

  it('measures actual rendered line counts', () => {
    expect(getRenderedLineCount(30)).toBe(1);
    expect(getRenderedLineCount(60)).toBe(2);
    expect(getRenderedLineCount(89)).toBe(3);
  });

  it('falls back safely for invalid measurements', () => {
    expect(getRenderedLineCount(0)).toBe(1);
    expect(getRenderedLineCount(Number.NaN)).toBe(1);
  });
});
