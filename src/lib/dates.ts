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

const KIGALI_TIME_ZONE = 'Africa/Kigali';
const DAY_IN_MILLISECONDS = 86_400_000;

interface DateParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const kigaliDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: KIGALI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const kigaliTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: KIGALI_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const value = parts.find((part) => part.type === type)?.value;
  return value ? Number(value) : Number.NaN;
}

function getCalendarDateInKigali(date: Date): CalendarDate {
  const parts = kigaliDateFormatter.formatToParts(date);
  return {
    year: readPart(parts, 'year'),
    month: readPart(parts, 'month'),
    day: readPart(parts, 'day'),
  };
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

export function getDaysRemaining(eventDate: string, now: Date = new Date()): number | null {
  const parts = parseISODate(eventDate);
  if (!parts) return null;

  const today = getCalendarDateInKigali(now);
  const eventUTC = Date.UTC(parts.year, parts.month - 1, parts.day);
  const todayUTC = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((eventUTC - todayUTC) / DAY_IN_MILLISECONDS);
}

export function getCountdownLabel(eventDate: string, now: Date = new Date()): string {
  const days = getDaysRemaining(eventDate, now);
  if (days === null) return 'DATE TO BE ANNOUNCED';
  if (days > 1) return `${days} DAYS TO GO`;
  if (days === 1) return '1 DAY TO GO';
  if (days === 0) return "IT'S TODAY!";
  return 'SEE YOU NEXT TIME';
}

export function getMillisecondsUntilNextKigaliMidnight(now: Date = new Date()): number {
  const parts = kigaliTimeFormatter.formatToParts(now);
  const hours = readPart(parts, 'hour');
  const minutes = readPart(parts, 'minute');
  const seconds = readPart(parts, 'second');
  const elapsedToday = ((hours * 60 + minutes) * 60 + seconds) * 1000 + now.getMilliseconds();

  return DAY_IN_MILLISECONDS - elapsedToday;
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
