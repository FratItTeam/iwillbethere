export const MESSAGE_LINE_HEIGHT = 30;
export const MAX_MESSAGE_SHIFT_LINES = 2;

export function getMessageShiftLines(lineCount: number): number {
  return Math.min(Math.max(Math.trunc(lineCount) - 1, 0), MAX_MESSAGE_SHIFT_LINES);
}

export function getMessageShiftPixels(lineCount: number): number {
  const shift = getMessageShiftLines(lineCount) * MESSAGE_LINE_HEIGHT;
  return shift === 0 ? 0 : -shift;
}

export function getRenderedLineCount(
  renderedHeight: number,
  lineHeight: number = MESSAGE_LINE_HEIGHT,
): number {
  if (!Number.isFinite(renderedHeight) || renderedHeight <= 0) return 1;
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 1;
  return Math.max(1, Math.round(renderedHeight / lineHeight));
}
