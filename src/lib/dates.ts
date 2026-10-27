const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

const WEEKDAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

const KINYARWANDA_WEEKDAYS = [
  'KU CYUMWERU',
  'KU WA MBERE',
  'KU WA KABIRI',
  'KU WA GATATU',
  'KU WA KANE',
  'KU WA GATANU',
  'KU WA GATANDATU',
] as const;

interface DateParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

function parseISODate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, weekday: date.getUTCDay() };
}

function localCalendarUTC(now: Date): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getDaysRemaining(eventDate: string, now: Date = new Date()): number | null {
  const parts = parseISODate(eventDate);
  if (!parts) return null;
  const eventUTC = Date.UTC(parts.year, parts.month - 1, parts.day);
  return Math.round((eventUTC - localCalendarUTC(now)) / 86_400_000);
}

export function getCountdownLabel(eventDate: string, now: Date = new Date()): string {
  const days = getDaysRemaining(eventDate, now);
  if (days === null) return 'DATE TO BE ANNOUNCED';
  if (days > 1) return `${days} DAYS TO GO`;
  if (days === 1) return '1 DAY TO GO';
  if (days === 0) return "IT'S TODAY!";
  return 'SEE YOU NEXT TIME';
}

export function getEventDateDisplay(eventDate: string): string {
  const parts = parseISODate(eventDate);
  if (!parts) return 'DATE TO BE ANNOUNCED';
  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

export function getEventWeekdayDisplay(eventDate: string): string {
  const parts = parseISODate(eventDate);
  if (!parts) return 'DATE / ITARIKI';
  return `${WEEKDAYS[parts.weekday]} / ${KINYARWANDA_WEEKDAYS[parts.weekday]}`;
}
