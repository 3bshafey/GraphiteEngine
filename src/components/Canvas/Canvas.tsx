import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useDrawing } from '../../hooks/useDrawing';
import { useCamera } from './useCamera';
import { useCanvasRenderer } from './useCanvasRenderer';

export const Canvas: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const store = useStore();
  const { camera, startPan, pan, endPan, isPanning } = useCamera();
  const { cellSize, setCellSize } = useStore();

  const CELL_MIN = 4, CELL_MAX = 80, CELL_STEP = 2;
  const { canvasRef, handleMouseDown: drawMouseDown, handleMouseMove: drawMouseMove, handleMouseUp: drawMouseUp, handleContextMenu } = useDrawing(camera);
  const isSpaceDown = useRef(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  useCanvasRenderer(canvasRef, camera, isActive);

  // ── Keyboard: Space bar for pan mode ──────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpaceDown.current) {
        isSpaceDown.current = true;
        setSpaceHeld(true);
        e.preventDefault();
      }
      if (e.key === 'z' || e.key === 'Z') store.undo();
      if (e.key === 'Escape') {
        store.setIsDrawing(false);
        store.setTempPoints([]);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown.current = false;
        setSpaceHeld(false);
        endPan();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [store, endPan]);

  // ── Mouse Events ───────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle mouse or Space+left → start pan
    if (e.button === 1 || (e.button === 0 && isSpaceDown.current)) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);
      return;
    }
    // Left click → drawing
    drawMouseDown(e);
  }, [startPan, drawMouseDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      pan(e.clientX, e.clientY);
      return;
    }
    drawMouseMove(e);
  }, [isPanning, pan, drawMouseMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      endPan();
      return;
    }
    drawMouseUp(e);
  }, [isPanning, endPan, drawMouseUp]);

  // ── Wheel: zoom via cellSize (same as algorithm panel input) ───────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCellSize(
        Math.max(CELL_MIN, Math.min(CELL_MAX, cellSize + (e.deltaY < 0 ? CELL_STEP : -CELL_STEP)))
      );
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [canvasRef, cellSize, setCellSize]);

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
  }, [isActive, canvasRef]);

  const cursor = spaceHeld || isPanning ? 'cursor-grab' : 'cursor-crosshair';

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        className={`w-full h-full bg-transparent ${cursor}`}
      />
    </div>
  );
};
