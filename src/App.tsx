import { useEffect, useRef, useState, type JSX } from 'react';
import { DEFAULT_CONTENT } from './data/defaults';
import { THEMES } from './data/themes';
import type {
  ExportScale,
  Feedback,
  FlyerContent,
  PhotoSelection,
} from './types';
import { buildPngFilename } from './lib/filename';
import { createFlyerPng, downloadBlob } from './lib/exportImage';
import { Flyer } from './components/Flyer';
import { FlyerPreview } from './components/FlyerPreview';
import { EditorPanel } from './components/EditorPanel';
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

  const handleExport = async () => {
    if (!content.firstName.trim()) {
      notify({ kind: 'error', message: 'Add your first name before downloading.' });
      document.getElementById('firstName')?.focus();
      return;
    }

    const node = flyerRef.current;
    if (!node) {
      notify({ kind: 'error', message: 'The flyer is not ready yet. Please try again.' });
      return;
    }

    setExporting(true);
    try {
      const { blob, width, height } = await createFlyerPng(node, scale);
      downloadBlob(blob, buildPngFilename(content.firstName));
      notify({
        kind: 'success',
        message: `Your flyer is ready — ${width} × ${height}px PNG downloaded.`,
      });
    } catch (error) {
      notify({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong while creating your flyer. Please try again.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Start over? This will clear your photo and reset every field.',
    );
    if (!confirmed) return;

    setContent({ ...DEFAULT_CONTENT });
    setPhoto(null);
    setScale(2);
    setResetKey((key) => key + 1);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#editor">
        Skip to the editor
      </a>

      <header className="site-header">
        <div className="brand">
          <span className="brand__logo">
            <FlyerLogo decorative />
          </span>
          <span className="brand__copy">
            <span className="brand__family">Chorale La Fraternité</span>
            <span className="brand__name">
              Frat Day <em>Flyer Studio</em>
            </span>
          </span>
        </div>
        <div className="site-header__actions">
          <span className="privacy-pill">
            <LockIcon />
            On-device editing
          </span>
          <a className="button button--small button--outline" href="#editor">
            Customize
          </a>
        </div>
      </header>

      <main className="app-main">
        <section className="preview-column" aria-labelledby="preview-title">
          <div className="preview-heading">
            <span className="eyebrow">
              <SparkleIcon />
              Live preview
            </span>
            <div className="preview-heading__row">
              <h1 id="preview-title">Your flyer</h1>
              <span className="live-badge">
                <i aria-hidden="true" />
                Updates as you type
              </span>
            </div>
          </div>

          <div className="preview-frame">
            <div className="preview-frame__mat">
              <FlyerPreview>
                <Flyer ref={flyerRef} content={content} photo={photo} theme={THEMES[content.themeId]} />
              </FlyerPreview>
            </div>
          </div>

          <p className="preview-caption">
            <LockIcon />
            Your photo never leaves this device. Export in crisp 2× resolution for
            WhatsApp, stories and print.
          </p>
        </section>

        <EditorPanel
          content={content}
          photo={photo}
          scale={scale}
          exporting={exporting}
          resetKey={resetKey}
          onChange={updateContent}
          onPhotoChange={setPhoto}
          onPhotoError={(message) => notify({ kind: 'error', message })}
          onScaleChange={setScale}
          onExport={() => void handleExport()}
          onReset={handleReset}
        />
      </main>

      <footer className="site-footer">
        <span>
          Made for the <strong>Chorale La Fraternité</strong> family.
        </span>
        <span>Twongere duhure.</span>
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
            aria-label="Dismiss notification"
            onClick={() => setFeedback(null)}
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
