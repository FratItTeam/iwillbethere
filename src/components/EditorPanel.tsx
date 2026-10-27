import type { JSX, ReactNode } from 'react';
import type { ExportScale, FlyerContent, PhotoSelection } from '../types';
import { FIELD_LIMITS } from '../data/defaults';
import { THEME_LIST } from '../data/themes';
import { buildPngFilename } from '../lib/filename';
import { PhotoPanel } from './PhotoPanel';
import { DownloadIcon, SparkleIcon } from './UiIcons';

interface EditorPanelProps {
  content: FlyerContent;
  photo: PhotoSelection | null;
  scale: ExportScale;
  exporting: boolean;
  resetKey: number;
  onChange: <K extends keyof FlyerContent>(key: K, value: FlyerContent[K]) => void;
  onPhotoChange: (photo: PhotoSelection | null) => void;
  onPhotoError: (message: string) => void;
  onScaleChange: (scale: ExportScale) => void;
  onExport: () => void;
  onReset: () => void;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}

function Field({ label, htmlFor, hint, optional, children }: FieldProps): JSX.Element {
  return (
    <div className="field">
      <div className="field__label-row">
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
        {optional ? <span className="field__optional">Optional</span> : null}
      </div>
      {children}
      {hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

export function EditorPanel({
  content,
  photo,
  scale,
  exporting,
  resetKey,
  onChange,
  onPhotoChange,
  onPhotoError,
  onScaleChange,
  onExport,
  onReset,
}: EditorPanelProps): JSX.Element {
  const outputWidth = 1080 * scale;
  const outputHeight = 1350 * scale;
  const filename = buildPngFilename(content.firstName);

  return (
    <section className="editor" id="editor" aria-label="Customize your flyer">
      <div className="editor__intro">
        <span className="eyebrow">
          <SparkleIcon />
          Your flyer, your words
        </span>
        <h2>Make it yours</h2>
        <p>
          Fill in your details, add a photo, then download a print-ready flyer.
          Everything happens on your device.
        </p>
      </div>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">01</span>
          <span>
            <strong>Your details</strong>
            <small>The star of this flyer is you.</small>
          </span>
        </legend>

        <Field
          label="First name"
          htmlFor="firstName"
          hint={
            <>
              Appears in your headline and becomes the filename:{' '}
              <code>{filename}</code>
            </>
          }
        >
          <input
            id="firstName"
            name="firstName"
            className="input input--large"
            type="text"
            value={content.firstName}
            maxLength={FIELD_LIMITS.firstName}
            autoComplete="given-name"
            placeholder="e.g. Jean"
            onChange={(event) => onChange('firstName', event.target.value)}
          />
        </Field>

        <Field
          label="Headline"
          htmlFor="headingTemplate"
          hint={
            <>
              Use <code>[First Name]</code> wherever your name should appear.
            </>
          }
        >
          <input
            id="headingTemplate"
            name="headingTemplate"
            className="input"
            type="text"
            value={content.headingTemplate}
            maxLength={FIELD_LIMITS.headingTemplate}
            onChange={(event) => onChange('headingTemplate', event.target.value)}
          />
        </Field>

        <Field label="Status line" htmlFor="statusLine">
          <input
            id="statusLine"
            name="statusLine"
            className="input"
            type="text"
            value={content.statusLine}
            maxLength={FIELD_LIMITS.statusLine}
            onChange={(event) => onChange('statusLine', event.target.value)}
          />
        </Field>

        <Field
          label="Short message"
          htmlFor="message"
          hint={`${content.message.length} / ${FIELD_LIMITS.message} characters`}
        >
          <textarea
            id="message"
            name="message"
            className="input textarea"
            rows={3}
            value={content.message}
            maxLength={FIELD_LIMITS.message}
            onChange={(event) => onChange('message', event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">02</span>
          <span>
            <strong>Your photo</strong>
            <small>A portrait makes it personal. It is optional.</small>
          </span>
        </legend>
        <PhotoPanel
          photo={photo}
          onChange={onPhotoChange}
          onError={onPhotoError}
          resetKey={resetKey}
        />
      </fieldset>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">03</span>
          <span>
            <strong>Event details</strong>
            <small>Where and when the reunion happens.</small>
          </span>
        </legend>

        <div className="field-grid">
          <Field label="Date" htmlFor="eventDate" hint="The countdown updates automatically.">
            <input
              id="eventDate"
              name="eventDate"
              className="input"
              type="date"
              value={content.eventDate}
              onChange={(event) => onChange('eventDate', event.target.value)}
            />
          </Field>
          <Field label="Arrival time" htmlFor="arrivalTime">
            <input
              id="arrivalTime"
              name="arrivalTime"
              className="input"
              type="text"
              value={content.arrivalTime}
              maxLength={FIELD_LIMITS.arrivalTime}
              placeholder="e.g. 13H00"
              onChange={(event) => onChange('arrivalTime', event.target.value)}
            />
          </Field>
        </div>

        <Field label="Venue" htmlFor="venue">
          <input
            id="venue"
            name="venue"
            className="input"
            type="text"
            value={content.venue}
            maxLength={FIELD_LIMITS.venue}
            placeholder="e.g. Saint Ignatius, Kibagabaga"
            onChange={(event) => onChange('venue', event.target.value)}
          />
        </Field>
      </fieldset>

      <details className="editor-card editor-card--collapsible">
        <summary>
          <span className="editor-card__number">04</span>
          <span>
            <strong>Flyer wording</strong>
            <small>Customize the smaller copy and fraternity names.</small>
          </span>
          <span className="summary-chevron" aria-hidden="true" />
        </summary>

        <div className="editor-card__body">
          <div className="field-grid">
            <Field label="Top kicker" htmlFor="header">
              <input
                id="header"
                name="header"
                className="input"
                type="text"
                value={content.header}
                maxLength={FIELD_LIMITS.header}
                onChange={(event) => onChange('header', event.target.value)}
              />
            </Field>
            <Field label="Event title" htmlFor="eventTitle">
              <input
                id="eventTitle"
                name="eventTitle"
                className="input"
                type="text"
                value={content.eventTitle}
                maxLength={FIELD_LIMITS.eventTitle}
                onChange={(event) => onChange('eventTitle', event.target.value)}
              />
            </Field>
          </div>

          <Field label="Subtitle" htmlFor="subtitle">
            <input
              id="subtitle"
              name="subtitle"
              className="input"
              type="text"
              value={content.subtitle}
              maxLength={FIELD_LIMITS.subtitle}
              onChange={(event) => onChange('subtitle', event.target.value)}
            />
          </Field>

          <Field label="Tagline" htmlFor="tagline">
            <input
              id="tagline"
              name="tagline"
              className="input"
              type="text"
              value={content.tagline}
              maxLength={FIELD_LIMITS.tagline}
              onChange={(event) => onChange('tagline', event.target.value)}
            />
          </Field>

          <Field label="Footer quote" htmlFor="quote" optional>
            <input
              id="quote"
              name="quote"
              className="input"
              type="text"
              value={content.quote}
              maxLength={FIELD_LIMITS.quote}
              onChange={(event) => onChange('quote', event.target.value)}
            />
          </Field>

          <Field
            label="Organizers"
            htmlFor="organizers"
            optional
            hint="One name per line."
          >
            <textarea
              id="organizers"
              name="organizers"
              className="input textarea"
              rows={3}
              value={content.organizers}
              maxLength={FIELD_LIMITS.organizers}
              onChange={(event) => onChange('organizers', event.target.value)}
            />
          </Field>
        </div>
      </details>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">05</span>
          <span>
            <strong>Look &amp; download</strong>
            <small>Pick a palette, then save your flyer.</small>
          </span>
        </legend>

        <div className="field">
          <span className="field__label">Color story</span>
          <div className="theme-options">
            {THEME_LIST.map((themeOption) => (
              <label
                key={themeOption.id}
                className={`theme-option${content.themeId === themeOption.id ? ' is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={themeOption.id}
                  checked={content.themeId === themeOption.id}
                  onChange={() => onChange('themeId', themeOption.id)}
                />
                <span className="theme-option__swatches" aria-hidden="true">
                  <i style={{ background: themeOption.ink }} />
                  <i style={{ background: themeOption.accent }} />
                  <i style={{ background: themeOption.soft }} />
                </span>
                <span className="theme-option__copy">
                  <strong>{themeOption.name}</strong>
                  <small>{themeOption.description}</small>
                </span>
                <span className="theme-option__check" aria-hidden="true" />
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">Download size</span>
          <div className="size-options">
            {(
              [
                { value: 1, label: 'Standard', note: '1080 × 1350' },
                { value: 2, label: 'High-res', note: '2160 × 2700', recommended: true },
                { value: 3, label: 'Maximum', note: '3240 × 4050' },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`size-option${scale === option.value ? ' is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="exportScale"
                  value={option.value}
                  checked={scale === option.value}
                  onChange={() => onScaleChange(option.value as ExportScale)}
                />
                <strong>{option.value}×</strong>
                <span>{option.label}</span>
                <small>{option.note}</small>
                {option.value === 2 ? <em>Recommended</em> : null}
              </label>
            ))}
          </div>
        </div>

        <button
          className="button button--primary export-button"
          type="button"
          onClick={onExport}
          disabled={exporting}
        >
          <DownloadIcon />
          <span>
            {exporting ? 'Creating your flyer…' : 'Download my flyer'}
            {!exporting ? (
              <small>
                PNG · {outputWidth} × {outputHeight}
              </small>
            ) : null}
          </span>
        </button>

        <div className="editor-footer">
          <p>
            Saved at <code>{filename}</code>. Your photo stays in this browser.
          </p>
          <button className="text-button" type="button" onClick={onReset}>
            Start over
          </button>
        </div>
      </fieldset>
    </section>
  );
}
