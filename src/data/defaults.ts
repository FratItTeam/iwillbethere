import type { FlyerContent } from '../types';

export const FIXED_FLYER_CONTENT = {
  header: 'TWONGERE DUHURE!',
  eventTitle: 'FRAT DAY',
  subtitle: '– MEET & GREET 2026',
  headingTemplate: 'I, [First Name], will be There!',
  messageLabel: 'The Message',
  messagePlaceholder: 'Add a short message for your friends.',
  tagline: 'RECONNECT. SHARE. BELONG.',
  quote: '« Pour le Seigneur, nous chanterons »',
  organizers:
    'Chorale La Fraternité Universelle\nChorale Fraternité Mère de l’UR\nForum des Anciens de la Chorale Fraternité',
} as const;

export const OFFICIAL_EVENT = {
  date: '2026-10-31',
  arrivalTime: '13H00',
  venue: 'Saint Ignatius, Kibagabaga',
} as const;

export const DEFAULT_CONTENT: FlyerContent = {
  firstName: 'First Name',
  headlineEmoji: '',
  statusLine: 'Not Planning to Miss!!!!',
  message: "I miss you! Can't wait to see you!",
};

export const FIELD_LIMITS = {
  firstName: 10,
  firstNameEmoji: 1,
  statusLine: 50,
  message: 150,
} as const;

export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
