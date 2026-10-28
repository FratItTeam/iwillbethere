import { useState, type JSX, type ReactNode } from 'react';
import { UI_COPY } from '../data/copy';
import { FIELD_LIMITS } from '../data/defaults';
import { buildHeadline } from '../lib/content';
import {
  countEmoji,
  countGraphemes,
  validateFirstName,
} from '../lib/text';
import type { FlyerContent, PhotoSelection } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { PhotoPanel } from './PhotoPanel';
import { SparkleIcon } from './UiIcons';

interface EditorPanelProps {
  content: FlyerContent;
  photo: PhotoSelection | null;
  onChange: <K extends keyof FlyerContent>(key: K, value: FlyerContent[K]) => void;
  onPhotoChange: (photo: PhotoSelection | null) => void;
  onPhotoError: (message: string) => void;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  counter?: string;
  children: ReactNode;
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  counter,
  children,
}: FieldProps): JSX.Element {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const counterId = htmlFor ? `${htmlFor}-counter` : undefined;
  const labelElement = htmlFor ? (
    <label className="field__label" htmlFor={htmlFor}>
      {label}
    </label>
  ) : (
    <span className="field__label">{label}</span>
  );

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <div className="field__label-row">
        {labelElement}
        {counter ? (
          <span className="field__counter" id={counterId}>
            {counter}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EditorPanel({
  content,
  photo,
  onChange,
  onPhotoChange,
  onPhotoError,
}: EditorPanelProps): JSX.Element {
  const [nameError, setNameError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const { fields, photo: photoCopy, sections, intro, validation } = UI_COPY;
  const headline = buildHeadline(content.firstName, content.headlineEmoji);
  const nameLength = countGraphemes(content.firstName.trim());
  const statusLength = countGraphemes(content.statusLine);
  const messageLength = countGraphemes(content.message);

  const handleNameChange = (value: string) => {
    if (countGraphemes(value.trim()) > FIELD_LIMITS.firstName) {
      setNameError(validation.nameTooLong);
      return;
    }
    if (countEmoji(value) > FIELD_LIMITS.firstNameEmoji) {
      setNameError(validation.nameTooManyEmoji);
      return;
    }

    setNameError(null);
    onChange('firstName', value);
  };

  const handleNameBlur = () => {
    const trimmed = content.firstName.trim();
    if (trimmed !== content.firstName) onChange('firstName', trimmed);
    setNameError(validateFirstName(trimmed));
  };

  const handleStatusChange = (value: string) => {
    if (countGraphemes(value) > FIELD_LIMITS.statusLine) {
      setStatusError(validation.statusTooLong);
      return;
    }

    setStatusError(null);
    onChange('statusLine', value);
  };

  const handleMessageChange = (value: string) => {
    if (countGraphemes(value) > FIELD_LIMITS.message) {
      setMessageError(validation.messageTooLong);
      return;
    }

    setMessageError(null);
    onChange('message', value);
  };

  const nameDescriptionIds = [
    'firstName-hint',
    'firstName-counter',
    nameError ? 'firstName-error' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const statusDescriptionIds = [
    'statusLine-hint',
    'statusLine-counter',
    statusError ? 'statusLine-error' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const messageDescriptionIds = [
    'message-hint',
    'message-counter',
    messageError ? 'message-error' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="editor" id="editor" aria-label="Create your flyer">
      <div className="editor__intro">
        <span className="eyebrow">
          <SparkleIcon />
          {intro.eyebrow}
        </span>
        <h2>{intro.title}</h2>
        <p>{intro.description}</p>
      </div>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">{sections.details.number}</span>
          <span>
            <strong>{sections.details.title}</strong>
            <small>{sections.details.subtitle}</small>
          </span>
        </legend>

        <Field
          label={fields.firstName.label}
          htmlFor="firstName"
          hint={fields.firstName.helper}
          error={nameError}
          counter={`${nameLength} / ${FIELD_LIMITS.firstName}`}
        >
          <input
            id="firstName"
            name="firstName"
            className="input input--large"
            type="text"
            value={content.firstName}
            autoComplete="given-name"
            placeholder={fields.firstName.placeholder}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameDescriptionIds}
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={handleNameBlur}
          />
        </Field>

        <Field
          label={fields.headline.label}
          hint={fields.headline.helper}
        >
          <div className="headline-preview">
            <span className="headline-preview__text">{headline}</span>
            <EmojiPicker
              value={content.headlineEmoji}
              onChange={(emoji) => onChange('headlineEmoji', emoji)}
            />
          </div>
        </Field>

        <Field
          label={fields.statusLine.label}
          htmlFor="statusLine"
          hint={fields.statusLine.helper}
          error={statusError}
          counter={`${statusLength} / ${FIELD_LIMITS.statusLine}`}
        >
          <input
            id="statusLine"
            name="statusLine"
            className="input"
            type="text"
            value={content.statusLine}
            aria-invalid={Boolean(statusError)}
            aria-describedby={statusDescriptionIds}
            onChange={(event) => handleStatusChange(event.target.value)}
          />
        </Field>

        <Field
          label={fields.message.label}
          htmlFor="message"
          hint={fields.message.helper}
          error={messageError}
          counter={`${messageLength} / ${FIELD_LIMITS.message}`}
        >
          <textarea
            id="message"
            name="message"
            className="input textarea"
            rows={3}
            value={content.message}
            aria-invalid={Boolean(messageError)}
            aria-describedby={messageDescriptionIds}
            onChange={(event) => handleMessageChange(event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">{sections.photo.number}</span>
          <span>
            <strong>{sections.photo.title}</strong>
            <small>{sections.photo.subtitle}</small>
          </span>
        </legend>
        <p className="photo-required-hint">{photoCopy.helper}</p>
        <PhotoPanel
          photo={photo}
          onChange={onPhotoChange}
          onError={onPhotoError}
        />
      </fieldset>
    </section>
  );
}
