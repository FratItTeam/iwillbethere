import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from 'react';

type TextTag = 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3';

interface FitTextProps {
  text: string;
  maxFontSize: number;
  minFontSize: number;
  as?: TextTag;
  className?: string;
  wrapperStyle?: CSSProperties;
  textStyle?: CSSProperties;
  nowrap?: boolean;
}

export function FitText({
  text,
  maxFontSize,
  minFontSize,
  as = 'div',
  className = '',
  wrapperStyle,
  textStyle,
  nowrap = false,
}: FitTextProps): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const Tag = as as 'div';

  useLayoutEffect(() => {
    let cancelled = false;

    const fit = () => {
      const wrapper = wrapperRef.current;
      const textElement = textRef.current;
      if (!wrapper || !textElement || cancelled) return;

      const doesFit = () => {
        const widthFits = textElement.scrollWidth <= wrapper.clientWidth + 1;
        if (nowrap) return widthFits;
        return widthFits && textElement.scrollHeight <= wrapper.clientHeight + 1;
      };

      textElement.style.fontSize = `${maxFontSize}px`;
      if (doesFit()) {
        setFontSize(maxFontSize);
        return;
      }

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      while (high - low > 0.5) {
        const middle = (low + high) / 2;
        textElement.style.fontSize = `${middle}px`;
        if (doesFit()) {
          best = middle;
          low = middle;
        } else {
          high = middle;
        }
      }

      textElement.style.fontSize = `${best}px`;
      setFontSize(best);
    };

    fit();

    const fonts = document.fonts;
    if (fonts) {
      void fonts.ready.then(() => {
        if (!cancelled) fit();
      });
    }

    return () => {
      cancelled = true;
    };
  }, [maxFontSize, minFontSize, nowrap, text]);

  return (
    <div
      ref={wrapperRef}
      className={`fit-text ${className}`.trim()}
      style={wrapperStyle}
      data-fitted-size={Number(fontSize.toFixed(1))}
    >
      <Tag
        ref={textRef}
        className="fit-text__inner"
        style={{
          fontSize: `${fontSize}px`,
          ...(nowrap ? { whiteSpace: 'nowrap' } : null),
          ...textStyle,
        }}
      >
        {text}
      </Tag>
    </div>
  );
}
