export interface FlyerContent {
  firstName: string;
  headlineEmoji: string;
  message: string;
}

export interface FlyerPalette {
  ink: string;
  accent: string;
  soft: string;
  muted: string;
  rule: string;
  ring: string;
  logo: string;
  ornament: string;
}

export interface PhotoSelection {
  objectUrl: string;
  name: string;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
}

export type ExportScale = 1 | 2 | 3;

export type FeedbackKind = 'success' | 'error' | 'info';

export interface Feedback {
  kind: FeedbackKind;
  message: string;
}
