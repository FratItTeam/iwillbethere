import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type JSX,
} from 'react';
import type { PhotoSelection } from '../types';
import { loadPhoto, validatePhotoFile } from '../lib/photo';
import { CameraIcon, LockIcon, RefreshIcon } from './UiIcons';

interface PhotoPanelProps {
  photo: PhotoSelection | null;
  onChange: (photo: PhotoSelection | null) => void;
  onError: (message: string) => void;
  resetKey: number;
}

export function PhotoPanel({
  photo,
  onChange,
  onError,
  resetKey,
}: PhotoPanelProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = '';
  }, [resetKey]);

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setBusy(true);
    try {
      const loaded = await loadPhoto(file);
      onChange({
        ...loaded,
        name: file.name,
        positionX: 50,
        positionY: 50,
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'That photo could not be added.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
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
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {photo ? (
        <>
          <div className="photo-current">
            <img className="photo-current__thumb" src={photo.dataUrl} alt="" />
            <div className="photo-current__copy">
              <span className="photo-current__eyebrow">Photo ready</span>
              <span className="photo-current__name" title={photo.name}>
                {photo.name}
              </span>
              <span className="photo-current__meta">
                {photo.width} × {photo.height}px
              </span>
            </div>
            <div className="photo-current__actions">
              <button
                className="button button--small button--quiet"
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                <RefreshIcon />
                Replace
              </button>
              <button
                className="button button--small button--text"
                type="button"
                onClick={() => onChange(null)}
              >
                Remove
              </button>
            </div>
          </div>

          <div className="crop-controls">
            <div className="crop-controls__heading">
              <span>Adjust the crop</span>
              <button
                className="crop-controls__reset"
                type="button"
                onClick={() => onChange({ ...photo, positionX: 50, positionY: 50 })}
              >
                Center
              </button>
            </div>
            <label className="range-field">
              <span>
                Horizontal <b>{photo.positionX}%</b>
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
                Vertical <b>{photo.positionY}%</b>
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
              className="button button--outline"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Opening photo…' : 'Choose a photo'}
            </button>
            <p>or drop it here · JPG, PNG or WebP · up to 10 MB</p>
          </div>
        </div>
      )}

      <p className="privacy-note">
        <LockIcon />
        Your photo is processed right here in your browser and never uploaded.
      </p>
    </div>
  );
}
