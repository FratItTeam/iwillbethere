import type { JSX } from 'react';
import logoMarkup from '../assets/flyer-logo.svg?raw';

interface FlyerLogoProps {
  className?: string;
  decorative?: boolean;
}

export function FlyerLogo({ className = '', decorative = false }: FlyerLogoProps): JSX.Element {
  return (
    <span
      className={`logo-mark ${className}`.trim()}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Chorale La Fraternité emblem'}
      aria-hidden={decorative ? 'true' : undefined}
      dangerouslySetInnerHTML={{ __html: logoMarkup }}
    />
  );
}
