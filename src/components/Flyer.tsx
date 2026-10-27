import { forwardRef, type CSSProperties, type JSX } from 'react';
import type { FlyerContent, PhotoSelection, Theme } from '../types';
import {
  getCountdownLabel,
  getEventDateDisplay,
  getEventWeekdayDisplay,
} from '../lib/dates';
import { personalizeHeading } from '../lib/content';
import { FitText } from './FitText';
import { FlyerLogo } from './FlyerLogo';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { MusicNote, RingOrnament, Sparkle } from './Decorations';

interface FlyerProps {
  content: FlyerContent;
  photo: PhotoSelection | null;
  theme: Theme;
  now?: Date;
  id?: string;
}

export const Flyer = forwardRef<HTMLElement, FlyerProps>(function Flyer(
  { content, photo, theme, now, id = 'flyer' },
  ref,
): JSX.Element {
  const heading = personalizeHeading(content.headingTemplate, content.firstName);
  const countdownLabel = getCountdownLabel(content.eventDate, now);
  const photoStyle = photo
    ? ({ objectPosition: `${photo.positionX}% ${photo.positionY}%` } as CSSProperties)
    : undefined;

  const themeStyle = {
    '--flyer-ink': theme.ink,
    '--flyer-accent': theme.accent,
    '--flyer-soft': theme.soft,
    '--flyer-muted': theme.muted,
    '--flyer-rule': theme.rule,
    '--flyer-ring': theme.ring,
    '--flyer-logo': theme.logo,
    '--flyer-ornament': theme.ornament,
  } as CSSProperties;

  return (
    <article
      id={id}
      ref={ref}
      className="flyer"
      style={themeStyle}
      aria-label="Your Frat Day flyer"
    >
      <header className="flyer__header">
        <FitText
          className="fit-header"
          text={content.header}
          maxFontSize={22}
          minFontSize={10}
          nowrap
        />
        <FitText
          as="h1"
          className="fit-event-title"
          text={content.eventTitle}
          maxFontSize={78}
          minFontSize={40}
          nowrap
        />
        <FitText
          className="fit-subtitle"
          text={content.subtitle}
          maxFontSize={28}
          minFontSize={14}
          nowrap
        />
      </header>

      <FlyerLogo className="flyer__logo" decorative />
      <MusicNote className="flyer__music-note" />

      <div className="flyer__divider" aria-hidden="true" />

      <div className="flyer__photo-area">
        <div className="flyer__photo-halo" aria-hidden="true" />
        <div className={`flyer__photo-frame${photo ? ' has-photo' : ''}`}>
          {photo ? (
            <img
              className="flyer__photo"
              src={photo.dataUrl}
              alt={content.firstName ? `${content.firstName}'s portrait` : 'Your portrait'}
              style={photoStyle}
              draggable={false}
            />
          ) : (
            <PhotoPlaceholder />
          )}
        </div>
      </div>

      <section className="flyer__right" aria-label="Your personalized message">
        <FitText
          className="fit-status"
          text={content.statusLine}
          maxFontSize={16}
          minFontSize={9}
          nowrap
        />

        <FitText
          as="h2"
          className="fit-heading"
          text={heading}
          maxFontSize={72.3}
          minFontSize={28}
        />

        <div className="flyer__tagline-pill">
          <FitText
            className="fit-tagline"
            text={content.tagline}
            maxFontSize={15.2}
            minFontSize={8}
            nowrap
          />
        </div>
      </section>

      <div className="flyer__message-area">
        <div className="flyer__message-label">MY MESSAGE:</div>
        <FitText
          className="fit-message"
          text={content.message || 'Add a short message for your friends.'}
          maxFontSize={20}
          minFontSize={10}
        />
      </div>

      <div className="flyer__countdown-wrap" aria-label={`Countdown: ${countdownLabel}`}>
        <Sparkle className="flyer__countdown-sparkle" />
        <FitText
          className="fit-countdown"
          text={countdownLabel}
          maxFontSize={34}
          minFontSize={12}
          nowrap
        />
        <Sparkle className="flyer__countdown-sparkle" />
      </div>

      <section className="flyer__panel" aria-label="Event details">
        <div className="flyer__date-block">
          <FitText
            className="fit-weekday"
            text={getEventWeekdayDisplay(content.eventDate)}
            maxFontSize={16}
            minFontSize={7}
            nowrap
          />
          <FitText
            className="fit-date"
            text={getEventDateDisplay(content.eventDate)}
            maxFontSize={43}
            minFontSize={18}
            nowrap
          />
          <div className="flyer__ready">I am ready!!!!</div>
        </div>

        <div className="flyer__panel-divider" aria-hidden="true" />

        <div className="flyer__panel-right">
          <FitText
            className="fit-arrival"
            text={`Arrival Time: ${content.arrivalTime || 'TBA'}`}
            maxFontSize={34.9}
            minFontSize={14}
            nowrap
          />
          <FitText
            className="fit-venue"
            text={content.venue || 'VENUE TO BE ANNOUNCED'}
            maxFontSize={26.5}
            minFontSize={11}
          />
        </div>
      </section>

      <footer className="flyer__footer">
        <div className="flyer__quote-row">
          <span className="flyer__quote-line" aria-hidden="true" />
          <FitText
            as="p"
            className="fit-quote"
            text={content.quote}
            maxFontSize={22.7}
            minFontSize={12}
            nowrap
          />
          <span className="flyer__quote-line" aria-hidden="true" />
        </div>

        <FitText
          className="fit-organizers"
          text={content.organizers}
          maxFontSize={21.5}
          minFontSize={8}
        />

        <RingOrnament className="flyer__spiral flyer__spiral--left" />
        <RingOrnament className="flyer__spiral flyer__spiral--right" />
      </footer>
    </article>
  );
});
