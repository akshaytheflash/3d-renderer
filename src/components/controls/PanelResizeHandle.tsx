import React, { useRef, useState } from 'react';
import { sound } from '../../core/audio/synthAudio';

interface PanelResizeHandleProps {
  side: 'left' | 'right';
  width: number;
  min: number;
  max: number;
  onResize: (width: number) => void;
  onReset: () => void;
}

/**
 * Draggable vertical divider between a side panel and the 3D viewport.
 * Pointer-capture based (works for mouse + touch), keyboard accessible
 * (arrow keys resize, shift = bigger steps), double-click resets.
 */
export const PanelResizeHandle: React.FC<PanelResizeHandleProps> = ({
  side,
  width,
  min,
  max,
  onResize,
  onReset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const clampWidth = (raw: number) => Math.min(max, Math.max(min, Math.round(raw)));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    sound.playClick(520);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    // The workspace frame spans the full window width, so the panel edge
    // sits at the pointer's x coordinate (mirrored for the right side).
    const raw = side === 'left' ? e.clientX : window.innerWidth - e.clientX;
    onResize(clampWidth(raw));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    sound.playClick(460);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 48 : 16;
    let next: number | null = null;
    if (e.key === 'ArrowLeft') {
      next = side === 'left' ? width - step : width + step;
    } else if (e.key === 'ArrowRight') {
      next = side === 'left' ? width + step : width - step;
    }
    if (next !== null) {
      e.preventDefault();
      onResize(clampWidth(next));
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${side} panel, current width ${width} pixels, arrow keys to adjust`}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      onDoubleClick={onReset}
      title="Drag to resize · double-click to reset"
      className={`relative z-30 w-1.5 shrink-0 cursor-col-resize outline-none transition-colors duration-150 ${
        isDragging ? 'bg-cyan-500/60' : 'bg-transparent hover:bg-cyan-500/30 focus-visible:bg-cyan-500/40'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Invisible wider hit area for easy grabbing */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
};
