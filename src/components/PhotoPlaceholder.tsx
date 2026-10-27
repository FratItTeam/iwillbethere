import type { JSX } from 'react';

export function PhotoPlaceholder(): JSX.Element {
  return (
    <div className="photo-placeholder">
      <div className="photo-placeholder__glow" />
      <svg
        className="photo-placeholder__icon"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="48" cy="38" r="17" stroke="currentColor" strokeWidth="2.2" />
        <path
          d="M20 78C22.4 63.6 33.8 56 48 56C62.2 56 73.6 63.6 76 78"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M71 19V29M66 24H76"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="25" cy="29" r="2.2" fill="currentColor" />
      </svg>
      <span className="photo-placeholder__label">Add your photo</span>
      <span className="photo-placeholder__hint">JPG · PNG · WEBP</span>
    </div>
  );
}
