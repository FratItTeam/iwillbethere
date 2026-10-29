import { useEffect, useRef, useState, type JSX } from 'react';
import { UI_COPY } from './data/copy';
import { DEFAULT_CONTENT } from './data/defaults';
import type {
  ExportScale,
  Feedback,
  FlyerContent,
  PhotoSelection,
} from './types';
import { buildPngFilename } from './lib/filename';
import { createFlyerPng, downloadBlob } from './lib/exportImage';
import { validateFirstName, validateMessage } from './lib/text';
import { Flyer } from './components/Flyer';
import { FlyerPreview } from './components/FlyerPreview';
import { EditorPanel } from './components/EditorPanel';
import { ExportPanel } from './components/ExportPanel';
import { FlyerLogo } from './components/FlyerLogo';
import {
  AlertIcon,
  CheckIcon,
  LockIcon,
  SparkleIcon,
} from './components/UiIcons';

export default function App(): JSX.Element {
  const [content, setContent] = useState<FlyerContent>({ ...DEFAULT_CONTENT });
  const [photo, setPhoto] = useState<PhotoSelection | null>(null);
  const [scale, setScale] = useState<ExportScale>(2);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const flyerRef = useRef<HTMLElement>(null);
  const feedbackTimer = useRef<number | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const exportingRef = useRef(false);

  const nameValidation = validateFirstName(content.firstName);
  const messageValidation = validateMessage(content.message);
  const canExport = !nameValidation && !messageValidation && photo !== null;
  const filename = nameValidation ? null : buildPngFilename(content.firstName);

  let readinessMessage: string = UI_COPY.export.ready;
  if (nameValidation && !photo) {
    readinessMessage = UI_COPY.export.missingBoth;
  } else if (nameValidation) {
    readinessMessage = UI_COPY.export.missingName;
  } else if (!photo) {
    readinessMessage = UI_COPY.export.missingPhoto;
  } else if (messageValidation) {
    readinessMessage = UI_COPY.export.invalidFields;
  }

  const notify = (nextFeedback: Feedback) => {
    if (feedbackTimer.current !== null) {
      window.clearTimeout(feedbackTimer.current);
    }
    setFeedback(nextFeedback);
    feedbackTimer.current = window.setTimeout(
      () => setFeedback(null),
      nextFeedback.kind === 'error' ? 9000 : 6000,
    );
  };

  useEffect(
    () => () => {
      if (feedbackTimer.current !== null) {
        window.clearTimeout(feedbackTimer.current);
      }
    },
    [],
  );

  const updateContent = <K extends keyof FlyerContent>(
    key: K,
    value: FlyerContent[K],
  ) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const handlePhotoChange = (nextPhoto: PhotoSelection | null) => {
    const nextUrl = nextPhoto?.objectUrl ?? null;
    if (photoUrlRef.current && photoUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(photoUrlRef.current);
    }
    photoUrlRef.current = nextUrl;
    setPhoto(nextPhoto);
  };

  const handleExport = async () => {
    if (exportingRef.current) return;

    if (nameValidation) {
      notify({ kind: 'error', message: nameValidation });
      document.getElementById('firstName')?.focus();
      return;
    }

    if (messageValidation) {
      notify({ kind: 'error', message: messageValidation });
      document.getElementById('message')?.focus();
      return;
    }

    if (!photo) {
      notify({ kind: 'error', message: UI_COPY.photo.errors.required });
      document.getElementById('photo-upload-trigger')?.focus();
      return;
    }

    const node = flyerRef.current;
    if (!node) {
      notify({ kind: 'error', message: UI_COPY.export.notReady });
      return;
    }

    exportingRef.current = true;
    setExporting(true);
    try {
      const { blob, width, height } = await createFlyerPng(node, scale, photo);
      downloadBlob(blob, buildPngFilename(content.firstName));
      notify({
        kind: 'success',
        message: UI_COPY.export.success(width, height),
      });
    } catch (error) {
      notify({
        kind: 'error',
        message:
          error instanceof Error ? error.message : UI_COPY.export.genericError,
      });
    } finally {
      exportingRef.current = false;
      setExporting(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(UI_COPY.export.resetConfirm);
    if (!confirmed) return;

    setContent({ ...DEFAULT_CONTENT });
    handlePhotoChange(null);
    setScale(2);
    setResetKey((key) => key + 1);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#editor">
        {UI_COPY.skipLink}
      </a>

      <header className="site-header">
        <div className="brand">
          <span className="brand__logo">
            <FlyerLogo decorative />
          </span>
          <span className="brand__copy">
            <span className="brand__family">{UI_COPY.brand.family}</span>
            <h1 className="brand__name">
              {UI_COPY.brand.name} <em>{UI_COPY.brand.accent}</em>
            </h1>
            <span className="brand__tagline">{UI_COPY.brand.tagline}</span>
          </span>
        </div>
        <div className="site-header__actions">
          <span className="privacy-pill">
            <LockIcon />
            {UI_COPY.header.privacy}
          </span>
          <a className="button button--small button--outline" href="#editor">
            {UI_COPY.header.action}
          </a>
        </div>
      </header>

      <main className="app-main">
        <section className="form-column" aria-label="Create your invitation">
          <EditorPanel
            key={resetKey}
            content={content}
            photo={photo}
            onChange={updateContent}
            onPhotoChange={handlePhotoChange}
            onPhotoError={(message) => notify({ kind: 'error', message })}
          />
        </section>

        <section className="preview-column" aria-labelledby="preview-title">
          <div className="preview-heading">
            <span className="eyebrow">
              <SparkleIcon />
              {UI_COPY.preview.eyebrow}
            </span>
            <div className="preview-heading__row">
              <h2 id="preview-title">{UI_COPY.preview.title}</h2>
              <span className="live-badge">
                <i aria-hidden="true" />
                {UI_COPY.preview.badge}
              </span>
            </div>
          </div>

          <div className="preview-frame">
            <div className="preview-frame__mat">
              <FlyerPreview>
                <Flyer ref={flyerRef} content={content} photo={photo} />
              </FlyerPreview>
            </div>
          </div>

          <p className="preview-caption">
            <LockIcon />
            {UI_COPY.preview.caption}
          </p>
        </section>

        <section className="action-column" aria-label="Download your flyer">
          <ExportPanel
            filename={filename}
            canExport={canExport}
            readinessMessage={readinessMessage}
            scale={scale}
            exporting={exporting}
            onScaleChange={setScale}
            onExport={() => void handleExport()}
            onReset={handleReset}
          />
        </section>
      </main>

      <footer className="site-footer">
        <span>
          {UI_COPY.footer.madeFor} <strong>{UI_COPY.footer.family}</strong>{' '}
          family.
        </span>
        <span>{UI_COPY.footer.signoff}</span>
      </footer>

      {feedback ? (
        <div
          className={`toast toast--${feedback.kind}`}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          aria-live={feedback.kind === 'error' ? 'assertive' : 'polite'}
        >
          <span className="toast__icon" aria-hidden="true">
            {feedback.kind === 'success' ? (
              <CheckIcon />
            ) : feedback.kind === 'error' ? (
              <AlertIcon />
            ) : (
              <SparkleIcon />
            )}
          </span>
          <span className="toast__message">{feedback.message}</span>
          <button
            className="toast__close"
            type="button"
            aria-label={UI_COPY.toast.dismiss}
            onClick={() => setFeedback(null)}
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
