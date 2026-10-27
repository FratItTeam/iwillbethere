import type { JSX, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function DownloadIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3V15M12 15L7.5 10.5M12 15L16.5 10.5M4 19.5H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CameraIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 8.5C4 7.395 4.895 6.5 6 6.5H8L9.2 4.5H14.8L16 6.5H18C19.105 6.5 20 7.395 20 8.5V17.5C20 18.605 19.105 19.5 18 19.5H6C4.895 19.5 4 18.605 4 17.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function LockIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.5 10V7.8C8.5 5.865 10.065 4.3 12 4.3C13.935 4.3 15.5 5.865 15.5 7.8V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.5C12.8 8.2 15.8 11.2 20.5 12C15.8 12.8 12.8 15.8 12 20.5C11.2 15.8 8.2 12.8 3.5 12C8.2 11.2 11.2 8.2 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RefreshIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M19.5 8.5V4.5M19.5 4.5H15.5M19.5 4.5L16.2 7.8C15.1 6.7 13.6 6 12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C14.62 18 16.85 16.32 17.7 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlertIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 8V12.5M12 16.2V16.3M10.1 4.7L3.2 17.3C2.5 18.6 3.4 20 4.8 20H19.2C20.6 20 21.5 18.6 20.8 17.3L13.9 4.7C13.2 3.4 10.8 3.4 10.1 4.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon(props: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
