import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from 'react';
import {
  MESSAGE_LINE_HEIGHT,
  getMessageShiftPixels,
  getRenderedLineCount,
} from '../lib/messageLayout';

interface MessageBlockProps {
  label: string;
  message: string;
  placeholder: string;
}

export function MessageBlock({
  label,
  message,
  placeholder,
}: MessageBlockProps): JSX.Element {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const text = message || placeholder;

  useLayoutEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !textRef.current) return;

      const computedLineHeight = Number.parseFloat(
        getComputedStyle(textRef.current).lineHeight,
      );
      const lineHeight = Number.isFinite(computedLineHeight)
        ? computedLineHeight
        : MESSAGE_LINE_HEIGHT;
      const nextLineCount = getRenderedLineCount(
        textRef.current.offsetHeight,
        lineHeight,
      );

      setLineCount((current) => (current === nextLineCount ? current : nextLineCount));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(textElement);

    if (document.fonts) {
      void document.fonts.ready.then(measure);
    }

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text]);

  const messageStyle = {
    '--message-shift': `${getMessageShiftPixels(lineCount)}px`,
  } as CSSProperties;

  return (
    <div className="flyer__message-area" style={messageStyle}>
      <div className="flyer__message-label">{label}</div>
      <p ref={textRef} className="flyer__message-text" data-lines={lineCount}>
        {text}
      </p>
    </div>
  );
}
