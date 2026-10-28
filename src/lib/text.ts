import { FIELD_LIMITS } from '../data/defaults';
import { UI_COPY } from '../data/copy';

const fallbackGraphemePattern =
  /(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\uFE0F|\u200D\p{Extended_Pictographic})*|[0-9#*]\uFE0F?\u20E3|\P{M}\p{M}*|\p{M}+)/gu;

const emojiPattern = /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u;
const keycapPattern = /^[0-9#*]\uFE0F?\u20E3$/u;

let graphemeSegmenter: Intl.Segmenter | null | undefined;

function getGraphemeSegmenter(): Intl.Segmenter | null {
  if (graphemeSegmenter !== undefined) return graphemeSegmenter;

  try {
    graphemeSegmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  } catch {
    graphemeSegmenter = null;
  }

  return graphemeSegmenter;
}

export function splitGraphemes(value: string): string[] {
  if (!value) return [];

  const segmenter = getGraphemeSegmenter();
  if (segmenter) {
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }

  try {
    return value.match(fallbackGraphemePattern) ?? [];
  } catch {
    return Array.from(value);
  }
}

export function countGraphemes(value: string): number {
  return splitGraphemes(value).length;
}

export function isEmojiGrapheme(grapheme: string): boolean {
  return emojiPattern.test(grapheme) || keycapPattern.test(grapheme);
}

export function countEmoji(value: string): number {
  return splitGraphemes(value).filter(isEmojiGrapheme).length;
}

export function validateFirstName(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return UI_COPY.validation.nameRequired;
  if (trimmed.toLowerCase() === 'first name') return UI_COPY.validation.namePlaceholder;
  if (countGraphemes(trimmed) > FIELD_LIMITS.firstName) {
    return UI_COPY.validation.nameTooLong;
  }
  if (countEmoji(trimmed) > FIELD_LIMITS.firstNameEmoji) {
    return UI_COPY.validation.nameTooManyEmoji;
  }

  return null;
}

export function validateStatusLine(value: string): string | null {
  return countGraphemes(value) > FIELD_LIMITS.statusLine
    ? UI_COPY.validation.statusTooLong
    : null;
}

export function validateMessage(value: string): string | null {
  return countGraphemes(value) > FIELD_LIMITS.message
    ? UI_COPY.validation.messageTooLong
    : null;
}
