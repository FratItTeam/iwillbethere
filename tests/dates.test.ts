import { describe, expect, it } from 'vitest';
import {
  getCountdownLabel,
  getDaysRemaining,
  getEventDateDisplay,
  getEventWeekdayDisplay,
} from '../src/lib/dates';

describe('getDaysRemaining', () => {
  it('counts calendar days until the event', () => {
    const now = new Date(2026, 9, 27, 23, 45);
    expect(getDaysRemaining('2026-10-31', now)).toBe(4);
  });

  it('returns zero on the event day regardless of the time', () => {
    const now = new Date(2026, 9, 31, 0, 5);
    expect(getDaysRemaining('2026-10-31', now)).toBe(0);
  });

  it('returns a negative number after the event', () => {
    const now = new Date(2026, 10, 2, 12);
    expect(getDaysRemaining('2026-10-31', now)).toBe(-2);
  });

  it('handles leap days', () => {
    const now = new Date(2028, 1, 28, 18);
    expect(getDaysRemaining('2028-02-29', now)).toBe(1);
  });

  it.each(['', '31-10-2026', '2026-13-01', '2026-02-30', '2026-1-1'])(
    'returns null for invalid dates: %s',
    (value) => {
      expect(getDaysRemaining(value, new Date(2026, 0, 1))).toBeNull();
    },
  );
});

describe('getCountdownLabel', () => {
  const now = new Date(2026, 9, 27);

  it('pluralises future days', () => {
    expect(getCountdownLabel('2026-10-31', now)).toBe('4 DAYS TO GO');
  });

  it('uses the singular for one day', () => {
    expect(getCountdownLabel('2026-10-28', now)).toBe('1 DAY TO GO');
  });

  it('celebrates the event day', () => {
    expect(getCountdownLabel('2026-10-27', now)).toBe("IT'S TODAY!");
  });

  it('handles past events', () => {
    expect(getCountdownLabel('2026-10-20', now)).toBe('SEE YOU NEXT TIME');
  });

  it('falls back for invalid dates', () => {
    expect(getCountdownLabel('not-a-date', now)).toBe('DATE TO BE ANNOUNCED');
  });
});

describe('date display helpers', () => {
  it('formats the event date in uppercase long form', () => {
    expect(getEventDateDisplay('2026-10-31')).toBe('31 OCTOBER 2026');
  });

  it('formats the English and Kinyarwanda weekday', () => {
    expect(getEventWeekdayDisplay('2026-10-31')).toBe(
      'SATURDAY / KU WA GATANDATU',
    );
  });

  it('returns safe fallbacks for invalid values', () => {
    expect(getEventDateDisplay('2026-02-31')).toBe('DATE TO BE ANNOUNCED');
    expect(getEventWeekdayDisplay('2026-02-31')).toBe('DATE / ITARIKI');
  });
});
