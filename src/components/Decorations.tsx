import type { JSX } from 'react';

interface DecorationProps {
  className?: string;
}

export function Sparkle({ className = '' }: DecorationProps): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="356 841 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M367.5 845V853M367.5 853L360.572 849M367.5 853V861M367.5 853L360.572 857M367.5 853L374.428 849M367.5 853L374.428 857"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MusicNote({ className = '' }: DecorationProps): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="985 322 28 35"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1000 348.001C1000 350.946 997.613 353.334 994.668 353.334C991.722 353.334 989.334 350.946 989.334 348.001C989.334 345.055 991.722 342.667 994.668 342.667C997.613 342.667 1000 345.055 1000 348.001ZM1000 348.001V326.666L1009.33 331.999"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RingOrnament({ className = '' }: DecorationProps): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {[30, 25, 20, 15, 10, 5].map((radius) => (
        <circle
          key={radius}
          cx="30"
          cy="30"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
