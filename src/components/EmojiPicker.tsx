import { useEffect, useId, useRef, useState, type JSX } from 'react';
import { HEADLINE_EMOJIS, UI_COPY } from '../data/copy';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;

    const focusSelectedEmoji = () => {
      const activeOption =
        dialogRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
        dialogRef.current?.querySelector<HTMLButtonElement>('button');
      activeOption?.focus();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };

    focusSelectedEmoji();
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const chooseEmoji = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="emoji-picker" ref={rootRef}>
      <button
        ref={triggerRef}
        className="emoji-picker__trigger"
        type="button"
        aria-label={UI_COPY.fields.headline.addEmoji}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">+</span>
      </button>

      {open ? (
        <div
          ref={dialogRef}
          id={dialogId}
          className="emoji-picker__popover"
          role="dialog"
          aria-modal="false"
          aria-label={UI_COPY.fields.headline.pickerTitle}
        >
          <p className="emoji-picker__title">{UI_COPY.fields.headline.pickerTitle}</p>
          <p className="emoji-picker__help">{UI_COPY.fields.headline.pickerHelp}</p>
          <div className="emoji-picker__grid">
            {HEADLINE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-picker__option"
                type="button"
                aria-label={`Use ${emoji} in your headline`}
                aria-pressed={value === emoji}
                onClick={() => chooseEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            className="emoji-picker__none"
            type="button"
            aria-pressed={!value}
            onClick={() => chooseEmoji('')}
          >
            {UI_COPY.fields.headline.pickerNone}
          </button>
        </div>
      ) : null}
    </div>
  );
}
