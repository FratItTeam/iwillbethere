import { FIXED_FLYER_CONTENT } from '../data/defaults';

export function personalizeHeading(template: string, firstName: string): string {
  return template.replaceAll('[First Name]', firstName);
}

export function getDisplayName(firstName: string): string {
  return firstName.trim() || 'First Name';
}

export function buildHeadline(firstName: string, emoji: string): string {
  const personalized = personalizeHeading(
    FIXED_FLYER_CONTENT.headingTemplate,
    getDisplayName(firstName),
  );

  if (!emoji) return personalized;

  const finalExclamation = personalized.lastIndexOf('!');
  if (finalExclamation === -1) return `${personalized}${emoji}`;

  return `${personalized.slice(0, finalExclamation)}${emoji}${personalized.slice(finalExclamation)}`;
}
