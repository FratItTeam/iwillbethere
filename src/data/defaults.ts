import type { FlyerContent } from '../types';

export const DEFAULT_CONTENT: FlyerContent = {
  header: 'TWONGERE DUHURE!',
  eventTitle: 'FRAT DAY',
  subtitle: '– MEET & GREET 2026',
  firstName: 'First Name',
  statusLine: 'Not Planning to Miss!!!!',
  headingTemplate: 'I, [First Name], will be There!',
  message: "I miss you! Can't wait to see you!",
  tagline: 'RECONNECT. SHARE. BELONG.',
  eventDate: '2026-10-31',
  arrivalTime: '13H00',
  venue: 'Saint Ignatius, Kibagabaga',
  quote: '« Pour le Seigneur, nous chanterons »',
  organizers:
    'Chorale La Fraternité Universelle\nChorale Fraternité Mère de l’UR\nForum des Anciens de la Chorale Fraternité',
  themeId: 'classic',
};

export const FIELD_LIMITS = {
  header: 36,
  eventTitle: 24,
  subtitle: 48,
  firstName: 30,
  statusLine: 64,
  headingTemplate: 90,
  message: 180,
  tagline: 48,
  arrivalTime: 24,
  venue: 70,
  quote: 120,
  organizers: 260,
} as const;

export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
