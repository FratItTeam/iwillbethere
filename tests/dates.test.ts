import { describe, expect, it } from 'vitest';
import {
  getCountdownLabel,
  getDaysRemaining,
  getEventDateDisplay,
  getEventWeekdayDisplay,
  getMillisecondsUntilNextKigaliMidnight,
} from '../src/lib/dates';

describe('getDaysRemaining', () => {
  it('counts calendar days until the event in Kigali', () => {
    const now = new Date('2026-10-27T12:00:00Z');
    expect(getDaysRemaining('2026-10-31', now)).toBe(4);
  });

  it('returns zero on the event day in Kigali regardless of the time', () => {
    expect(getDaysRemaining('2026-10-31', new Date('2026-10-30T22:00:00Z'))).toBe(0);
    expect(getDaysRemaining('2026-10-31', new Date('2026-10-31T21:59:59Z'))).toBe(0);
  });

  it('switches at Kigali midnight rather than UTC midnight', () => {
    expect(getDaysRemaining('2026-10-31', new Date('2026-10-30T21:59:59Z'))).toBe(1);
    expect(getDaysRemaining('2026-10-31', new Date('2026-10-30T22:00:00Z'))).toBe(0);
  });

  it('returns a negative number after the event', () => {
    expect(getDaysRemaining('2026-10-31', new Date('2026-11-01T22:00:00Z'))).toBe(-2);
  });

  it('handles leap days', () => {
    expect(getDaysRemaining('2028-02-29', new Date('2028-02-28T18:00:00Z'))).toBe(1);
  });

  it.each(['', '31-10-2026', '2026-13-01', '2026-02-30', '2026-1-1'])(
    'returns null for invalid dates: %s',
    (value) => {
      expect(getDaysRemaining(value, new Date('2026-01-01T12:00:00Z'))).toBeNull();
    },
  );
});

describe('getCountdownLabel', () => {
  it('pluralises future days', () => {
    expect(getCountdownLabel('2026-10-31', new Date('2026-10-27T12:00:00Z'))).toBe(
      '4 DAYS TO GO',
    );
  });

  it('uses the singular for one day', () => {
    expect(getCountdownLabel('2026-10-31', new Date('2026-10-30T12:00:00Z'))).toBe(
      '1 DAY TO GO',
    );
  });

  it('celebrates the event day in Kigali', () => {
    expect(getCountdownLabel('2026-10-31', new Date('2026-10-30T22:00:00Z'))).toBe(
      "IT'S TODAY!",
    );
  });

  it('handles past events', () => {
    expect(getCountdownLabel('2026-10-31', new Date('2026-11-03T12:00:00Z'))).toBe(
      'SEE YOU NEXT TIME',
    );
  });

  it('falls back for invalid dates', () => {
    expect(getCountdownLabel('not-a-date', new Date('2026-01-01T12:00:00Z'))).toBe(
      'DATE TO BE ANNOUNCED',
    );
  });
});

describe('getMillisecondsUntilNextKigaliMidnight', () => {
  it('counts down to Kigali midnight', () => {
    expect(
      getMillisecondsUntilNextKigaliMidnight(new Date('2026-10-30T21:59:00Z')),
    ).toBe(60_000);
  });

  it('starts a full day at midnight', () => {
    expect(
      getMillisecondsUntilNextKigaliMidnight(new Date('2026-10-30T22:00:00Z')),
    ).toBe(86_400_000);
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
