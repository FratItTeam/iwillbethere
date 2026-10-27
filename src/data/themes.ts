import type { Theme, ThemeId } from '../types';

export const THEMES: Record<ThemeId, Theme> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Burgundy & pink',
    ink: '#6E1637',
    accent: '#E72C78',
    soft: '#FFF0F5',
    muted: '#85556A',
    rule: '#E7B9CA',
    ring: '#F9CFDF',
    logo: '#8A0202',
    ornament: '#200B13',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Navy & rose',
    ink: '#1E2B4F',
    accent: '#D83A78',
    soft: '#F4F2FA',
    muted: '#6C647D',
    rule: '#D8D1E7',
    ring: '#E5DFF1',
    logo: '#1E2B4F',
    ornament: '#161C2E',
  },
  evergreen: {
    id: 'evergreen',
    name: 'Evergreen',
    description: 'Forest & clay',
    ink: '#174535',
    accent: '#D96B3B',
    soft: '#F7F1EA',
    muted: '#79695D',
    rule: '#E4D5C6',
    ring: '#EDE0D3',
    logo: '#174535',
    ornament: '#1D241D',
  },
};

export const THEME_LIST = Object.values(THEMES);
