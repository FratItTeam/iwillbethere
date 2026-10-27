import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface FlyerPreviewProps {
  children: ReactNode;
}

export function FlyerPreview({ children }: FlyerPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateScale = () => {
      const nextScale = stage.clientWidth / 1080;
      setScale((current) => (Math.abs(current - nextScale) > 0.0001 ? nextScale : current));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flyer-stage" ref={stageRef}>
      <div
        className="flyer-scaler"
        style={{
          width: 1080,
          height: 1350,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
