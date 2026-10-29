import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type JSX,
} from 'react';
import { UI_COPY } from '../data/copy';
import { isAbortError, loadPhoto, validatePhotoFile } from '../lib/photo';
import type { PhotoSelection } from '../types';
import { CameraIcon, LockIcon, RefreshIcon } from './UiIcons';

interface PhotoPanelProps {
  photo: PhotoSelection | null;
  onChange: (photo: PhotoSelection | null) => void;
  onError: (message: string) => void;
}

export function PhotoPanel({
  photo,
  onChange,
  onError,
}: PhotoPanelProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { photo: copy } = UI_COPY;

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      onError(validationError);
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setBusy(true);
    setError(null);
    try {
      const loaded = await loadPhoto(file, { signal: controller.signal });
      if (controller.signal.aborted || requestRef.current !== controller) {
        URL.revokeObjectURL(loaded.objectUrl);
        return;
      }
      onChange({
        ...loaded,
        name: file.name,
        positionX: 50,
        positionY: 50,
      });
    } catch (caught) {
      if (
        controller.signal.aborted ||
        isAbortError(caught) ||
        requestRef.current !== controller
      ) {
        return;
      }
      const message =
        caught instanceof Error ? caught.message : copy.errors.generic;
      setError(message);
      onError(message);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setBusy(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  const updatePosition = (axis: 'positionX' | 'positionY', value: number) => {
    if (!photo) return;
    onChange({ ...photo, [axis]: value });
  };

  return (
    <div className="photo-panel">
      <input
        ref={inputRef}
        id="photo-upload"
        className="sr-only"
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {photo ? (
        <>
          <div className="photo-current">
            <img className="photo-current__thumb" src={photo.objectUrl} alt="" />
            <div className="photo-current__copy">
              <span className="photo-current__eyebrow">{copy.ready}</span>
              <span className="photo-current__name" title={photo.name}>
                {photo.name}
              </span>
              <span className="photo-current__meta">
                {photo.width} × {photo.height}px
              </span>
            </div>
            <div className="photo-current__actions">
              <button
                id="photo-upload-trigger"
                className="button button--small button--quiet"
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                <RefreshIcon />
                {copy.replace}
              </button>
              <button
                className="button button--small button--text"
                type="button"
                onClick={() => {
                  requestRef.current?.abort();
                  requestRef.current = null;
                  setBusy(false);
                  setError(null);
                  onChange(null);
                }}
              >
                {copy.remove}
              </button>
            </div>
          </div>

          <div className="crop-controls">
            <div className="crop-controls__heading">
              <span>{copy.cropTitle}</span>
              <button
                className="crop-controls__reset"
                type="button"
                onClick={() => onChange({ ...photo, positionX: 50, positionY: 50 })}
              >
                {copy.center}
              </button>
            </div>
            <label className="range-field">
              <span>
                {copy.horizontal} <b>{photo.positionX}%</b>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={photo.positionX}
                onChange={(event) =>
                  updatePosition('positionX', Number(event.target.value))
                }
              />
            </label>
            <label className="range-field">
              <span>
                {copy.vertical} <b>{photo.positionY}%</b>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={photo.positionY}
                onChange={(event) =>
                  updatePosition('positionY', Number(event.target.value))
                }
              />
            </label>
          </div>
        </>
      ) : (
        <div
          className={`photo-drop${dragging ? ' is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            setDragging(false);
          }}
          onDrop={handleDrop}
        >
          <div className="photo-drop__icon">
            <CameraIcon />
          </div>
          <div className="photo-drop__copy">
            <button
              id="photo-upload-trigger"
              className="button button--outline"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? copy.opening : copy.choose}
            </button>
            <p>{copy.dropHint}</p>
          </div>
        </div>
      )}

      {error ? (
        <p className="photo-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="privacy-note">
        <LockIcon />
        {copy.privacy}
      </p>
    </div>
  );
}
