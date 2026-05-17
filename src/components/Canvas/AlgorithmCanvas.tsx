import React, { useCallback, useEffect, useRef } from 'react';
import { useCamera } from './useCamera';
import { useAlgorithmCanvasRenderer } from './useAlgorithmCanvasRenderer';
import { useStore } from '../../store/useStore';

const CELL_MIN = 4;
const CELL_MAX = 80;
const CELL_STEP = 2;

export const AlgorithmCanvas: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { camera, startPan, pan, endPan, isPanning } = useCamera();
  const { cellSize, setCellSize } = useStore();

  useAlgorithmCanvasRenderer(canvasRef, camera, isActive);

  // ── Mouse Events: all drags pan ────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);
    }
  }, [startPan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) pan(e.clientX, e.clientY);
  }, [isPanning, pan]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) endPan();
  }, [isPanning, endPan]);

  const handleMouseLeave = useCallback(() => {
    if (isPanning) endPan();
  }, [isPanning, endPan]);

  // ── Wheel: zoom via cellSize (same as algorithm panel input) ───────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // scrolling up (deltaY < 0) → bigger cells = zoom in
      // scrolling down (deltaY > 0) → smaller cells = zoom out
      setCellSize(
        Math.max(CELL_MIN, Math.min(CELL_MAX, cellSize + (e.deltaY < 0 ? CELL_STEP : -CELL_STEP)))
      );
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [cellSize, setCellSize]);

  // ── Prevent browser context menu ───────────────────────────────────
  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', prevent);
    return () => window.removeEventListener('contextmenu', prevent);
  }, []);

  // ── Resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current?.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    if (isActive) setTimeout(resize, 0);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isActive]);

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
      <canvas
        id="algorithm-canvas"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`w-full h-full bg-transparent ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      />
    </div>
  );
};
