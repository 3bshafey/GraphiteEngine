import React, { useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { useDrawing } from '../../hooks/useDrawing';
import { useCamera } from './useCamera';
import { useCanvasRenderer } from './useCanvasRenderer';

export const Canvas: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const store = useStore();
  
  const { camera, startPan, pan, panBy, endPan, zoom, resetCamera, isPanning } = useCamera();
  const { canvasRef, handleMouseDown: onDrawDown, handleMouseMove: onDrawMove, handleMouseUp: onDrawUp, handleContextMenu } = useDrawing(camera);
  
  useCanvasRenderer(canvasRef, camera, isActive);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        resetCamera();
      } else if (e.key === 'z' || e.key === 'Z') {
        store.undo();
      } else if (e.key === 'Escape') {
        store.setIsDrawing(false);
        store.setTempPoints([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetCamera, store]);

  // Disable browser context menu globally
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', preventContextMenu);
    return () => window.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  // Passive wheel listener for zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = canvas.getBoundingClientRect();
      if (!rect) return;
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      
      if (e.shiftKey) {
        // Hold Shift to pan with wheel
        panBy(-e.deltaX, -e.deltaY);
      } else {
        // Zoom by default (with or without Ctrl)
        zoom(screenX, screenY, e.deltaY);
      }
    };

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelEvent);
  }, [canvasRef, zoom]);

  const getScaledCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: e.clientX, y: e.clientY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: e.clientX * scaleX,
      y: e.clientY * scaleY
    };
  }, [canvasRef]);

  // Combined mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const isLeftClickOnSelectTool = e.button === 0 && store.currentMode === 'SELECT';
    const isMiddleClick = e.button === 1;

    if (isLeftClickOnSelectTool || isMiddleClick) {
      e.preventDefault();
      const coords = getScaledCoords(e);
      startPan(coords.x, coords.y);
      return;
    }
    
    onDrawDown(e);
  }, [startPan, onDrawDown, store.currentMode, getScaledCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const coords = getScaledCoords(e);
      pan(coords.x, coords.y);
      return;
    }
    onDrawMove(e);
  }, [isPanning, pan, onDrawMove, getScaledCoords]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      endPan();
      return;
    }
    onDrawUp(e);
  }, [isPanning, endPan, onDrawUp]);

  const handleMouseLeave = useCallback(() => {
    if (isPanning) {
      endPan();
    }
  }, [isPanning, endPan]);

  // Handle window resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    
    if (isActive) {
      setTimeout(resizeCanvas, 0);
    }

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isActive]);

  const getCursor = () => {
    if (isPanning) return 'cursor-grabbing';
    if (store.currentMode === 'SELECT') return 'cursor-grab';
    return 'cursor-crosshair';
  };

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onDoubleClick={resetCamera}
        className={`w-full h-full bg-transparent ${getCursor()}`}
      />
    </div>
  );
};
