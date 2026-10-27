export interface FlyerContent {
  header: string;
  eventTitle: string;
  subtitle: string;
  firstName: string;
  statusLine: string;
  headingTemplate: string;
  message: string;
  tagline: string;
  eventDate: string;
  arrivalTime: string;
  venue: string;
  quote: string;
  organizers: string;
  themeId: ThemeId;
}

export type ThemeId = 'classic' | 'midnight' | 'evergreen';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
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
  dataUrl: string;
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
