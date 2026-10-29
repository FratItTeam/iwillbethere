import { describe, expect, it } from 'vitest';
import {
  PORTRAIT_DIFF_THRESHOLD,
  calculateCoverSourceRect,
  comparePatchPixels,
  isPortraitPatchAcceptable,
} from '../src/lib/portrait';

function rgba(...values: number[]): Uint8ClampedArray {
  return new Uint8ClampedArray(values);
}

describe('calculateCoverSourceRect', () => {
  it('crops a landscape image to a centered square', () => {
    const rect = calculateCoverSourceRect(800, 400, 327, 327, 50, 50);

    expect(rect.x).toBeCloseTo(200);
    expect(rect.y).toBeCloseTo(0);
    expect(rect.width).toBeCloseTo(400);
    expect(rect.height).toBeCloseTo(400);
  });

  it('moves the visible crop with the horizontal position', () => {
    const left = calculateCoverSourceRect(800, 400, 327, 327, 0, 50);
    const right = calculateCoverSourceRect(800, 400, 327, 327, 100, 50);

    expect(left.x).toBeCloseTo(0);
    expect(right.x).toBeCloseTo(400);
  });

  it('crops a portrait image to a centered square', () => {
    const rect = calculateCoverSourceRect(400, 800, 327, 327, 50, 50);

    expect(rect.x).toBeCloseTo(0);
    expect(rect.y).toBeCloseTo(200);
    expect(rect.width).toBeCloseTo(400);
    expect(rect.height).toBeCloseTo(400);
  });

  it('clamps positions outside the supported range', () => {
    const rect = calculateCoverSourceRect(800, 400, 327, 327, -50, 150);

    expect(rect.x).toBeCloseTo(0);
    expect(rect.y).toBeCloseTo(0);
  });
});

describe('comparePatchPixels', () => {
  it('reports no difference for identical opaque pixels', () => {
    const pixels = rgba(255, 0, 0, 255, 0, 255, 0, 255);
    const comparison = comparePatchPixels(pixels, pixels);

    expect(comparison).toEqual({
      difference: 0,
      comparedPixels: 2,
      totalPixels: 2,
    });
  });

  it('reports the mean RGB difference for different pixels', () => {
    const comparison = comparePatchPixels(
      rgba(255, 0, 0, 255),
      rgba(0, 0, 255, 255),
    );

    expect(comparison.difference).toBeCloseTo(170);
    expect(comparison.comparedPixels).toBe(1);
    expect(comparison.totalPixels).toBe(1);
  });

  it('ignores transparent pixels', () => {
    const comparison = comparePatchPixels(
      rgba(255, 0, 0, 0),
      rgba(0, 0, 255, 255),
    );

    expect(comparison.comparedPixels).toBe(0);
    expect(comparison.difference).toBe(0);
  });

  it('rejects mismatched patch data', () => {
    expect(() =>
      comparePatchPixels(rgba(255, 0, 0, 255), rgba(255, 0, 0)),
    ).toThrow('Portrait patches must have matching RGBA lengths.');
  });
});

describe('isPortraitPatchAcceptable', () => {
  it('accepts a difference at the threshold', () => {
    expect(
      isPortraitPatchAcceptable(
        {
          difference: PORTRAIT_DIFF_THRESHOLD,
          comparedPixels: 100,
          totalPixels: 100,
        },
        rgba(255, 0, 0, 255),
      ),
    ).toBe(true);
  });

  it('rejects a difference above the threshold', () => {
    expect(
      isPortraitPatchAcceptable(
        {
          difference: PORTRAIT_DIFF_THRESHOLD + 1,
          comparedPixels: 100,
          totalPixels: 100,
        },
        rgba(255, 0, 0, 255),
      ),
    ).toBe(false);
  });

  it('falls back to visible variation when too few opaque pixels can be compared', () => {
    const variedPixels = rgba(
      0, 0, 0, 255,
      255, 255, 255, 255,
    );

    expect(
      isPortraitPatchAcceptable(
        {
          difference: 0,
          comparedPixels: 0,
          totalPixels: 2,
        },
        variedPixels,
      ),
    ).toBe(true);
  });

  it('rejects an empty patch when there is nothing opaque to compare', () => {
    expect(
      isPortraitPatchAcceptable(
        {
          difference: 0,
          comparedPixels: 0,
          totalPixels: 1,
        },
        rgba(0, 0, 0, 0),
      ),
    ).toBe(false);
  });
});
