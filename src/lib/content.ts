export function personalizeHeading(template: string, firstName: string): string {
  return template.replaceAll('[First Name]', firstName);
}
