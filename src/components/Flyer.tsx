import { forwardRef, type CSSProperties, type JSX } from 'react';
import { FIXED_FLYER_CONTENT, OFFICIAL_EVENT } from '../data/defaults';
import { CLASSIC_PALETTE } from '../data/flyerPalette';
import {
  getCountdownLabel,
  getEventDateDisplay,
  getEventWeekdayDisplay,
} from '../lib/dates';
import { buildHeadline, getDisplayName } from '../lib/content';
import { useKigaliNow } from '../hooks/useKigaliNow';
import type { FlyerContent, PhotoSelection } from '../types';
import { FitText } from './FitText';
import { FlyerLogo } from './FlyerLogo';
import { MessageBlock } from './MessageBlock';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { MusicNote, RingOrnament, Sparkle } from './Decorations';

interface FlyerProps {
  content: FlyerContent;
  photo: PhotoSelection | null;
  now?: Date;
  id?: string;
}

export const Flyer = forwardRef<HTMLElement, FlyerProps>(function Flyer(
  { content, photo, now, id = 'flyer' },
  ref,
): JSX.Element {
  const liveNow = useKigaliNow();
  const currentNow = now ?? liveNow;
  const displayName = getDisplayName(content.firstName);
  const heading = buildHeadline(content.firstName, content.headlineEmoji);
  const countdownLabel = getCountdownLabel(OFFICIAL_EVENT.date, currentNow);
  const photoStyle = photo
    ? ({ objectPosition: `${photo.positionX}% ${photo.positionY}%` } as CSSProperties)
    : undefined;

  const paletteStyle = {
    '--flyer-ink': CLASSIC_PALETTE.ink,
    '--flyer-accent': CLASSIC_PALETTE.accent,
    '--flyer-soft': CLASSIC_PALETTE.soft,
    '--flyer-muted': CLASSIC_PALETTE.muted,
    '--flyer-rule': CLASSIC_PALETTE.rule,
    '--flyer-ring': CLASSIC_PALETTE.ring,
    '--flyer-logo': CLASSIC_PALETTE.logo,
    '--flyer-ornament': CLASSIC_PALETTE.ornament,
  } as CSSProperties;

  return (
    <article
      id={id}
      ref={ref}
      className="flyer"
      style={paletteStyle}
      aria-label="Your Frat Day flyer"
    >
      <header className="flyer__header">
        <FitText
          className="fit-header"
          text={FIXED_FLYER_CONTENT.header}
          maxFontSize={22}
          minFontSize={10}
          nowrap
        />
        <FitText
          as="h1"
          className="fit-event-title"
          text={FIXED_FLYER_CONTENT.eventTitle}
          maxFontSize={78}
          minFontSize={40}
          nowrap
        />
        <FitText
          className="fit-subtitle"
          text={FIXED_FLYER_CONTENT.subtitle}
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
              src={photo.objectUrl}
              alt={`${displayName}'s portrait`}
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
          text={FIXED_FLYER_CONTENT.statusLine}
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
            text={FIXED_FLYER_CONTENT.tagline}
            maxFontSize={15.2}
            minFontSize={8}
            nowrap
          />
        </div>
      </section>

      <MessageBlock
        label={FIXED_FLYER_CONTENT.messageLabel}
        message={content.message}
        placeholder={FIXED_FLYER_CONTENT.messagePlaceholder}
      />

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
            text={getEventWeekdayDisplay(OFFICIAL_EVENT.date)}
            maxFontSize={16}
            minFontSize={7}
            nowrap
          />
          <FitText
            className="fit-date"
            text={getEventDateDisplay(OFFICIAL_EVENT.date)}
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
            text={`Arrival Time: ${OFFICIAL_EVENT.arrivalTime}`}
            maxFontSize={34.9}
            minFontSize={14}
            nowrap
          />
          <FitText
            className="fit-venue"
            text={OFFICIAL_EVENT.venue}
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
            text={FIXED_FLYER_CONTENT.quote}
            maxFontSize={22.7}
            minFontSize={12}
            nowrap
          />
          <span className="flyer__quote-line" aria-hidden="true" />
        </div>

        <FitText
          className="fit-organizers"
          text={FIXED_FLYER_CONTENT.organizers}
          maxFontSize={21.5}
          minFontSize={8}
        />

        <RingOrnament className="flyer__spiral flyer__spiral--left" />
        <RingOrnament className="flyer__spiral flyer__spiral--right" />
      </footer>
    </article>
  );
});
