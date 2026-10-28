import type { JSX } from 'react';
import { UI_COPY } from '../data/copy';
import type { ExportScale } from '../types';
import { DownloadIcon, SparkleIcon } from './UiIcons';

interface ExportPanelProps {
  filename: string | null;
  canExport: boolean;
  readinessMessage: string;
  scale: ExportScale;
  exporting: boolean;
  onScaleChange: (scale: ExportScale) => void;
  onExport: () => void;
  onReset: () => void;
}

export function ExportPanel({
  filename,
  canExport,
  readinessMessage,
  scale,
  exporting,
  onScaleChange,
  onExport,
  onReset,
}: ExportPanelProps): JSX.Element {
  const outputWidth = 1080 * scale;
  const outputHeight = 1350 * scale;
  const { sections, export: exportCopy } = UI_COPY;

  return (
    <section className="editor editor--export" id="download" aria-labelledby="download-title">
      <div className="editor__intro">
        <span className="eyebrow">
          <SparkleIcon />
          {exportCopy.eyebrow}
        </span>
        <h2 id="download-title">{sections.export.title}</h2>
        <p>{sections.export.subtitle}</p>
      </div>

      <fieldset className="editor-card">
        <legend>
          <span className="editor-card__number">{sections.export.number}</span>
          <span>
            <strong>{exportCopy.sizeLegend}</strong>
            <small>{exportCopy.sizeHelp}</small>
          </span>
        </legend>

        <div className="field">
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

        <p
          id="export-readiness"
          className={`export-readiness${canExport ? ' is-ready' : ''}`}
          role="status"
        >
          {readinessMessage}
        </p>

        <button
          className="button button--primary export-button"
          type="button"
          onClick={onExport}
          disabled={exporting || !canExport}
          aria-describedby="export-readiness"
        >
          <DownloadIcon />
          <span>
            {exporting ? exportCopy.exporting : exportCopy.button}
            {!exporting ? (
              <small>
                PNG · {outputWidth} × {outputHeight}
              </small>
            ) : null}
          </span>
        </button>

        <div className="editor-footer">
          <p>
            {filename ? exportCopy.filename(filename) : exportCopy.filenamePending}{' '}
            {exportCopy.privacy}
          </p>
          <button className="text-button" type="button" onClick={onReset}>
            {exportCopy.reset}
          </button>
        </div>
      </fieldset>
    </section>
  );
}
