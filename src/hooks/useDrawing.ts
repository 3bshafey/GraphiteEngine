import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Point, Shape, ShapeType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { screenToWorld } from '../components/Canvas/transforms';
import type { Camera } from '../components/Canvas/Camera';

export const useDrawing = (camera: Camera) => {
  const store = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return screenToWorld(screenX, screenY, camera);
  }, [camera]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore middle mouse button for drawing (used for panning)
    if (e.button === 1 || e.button === 2) return;

    if (store.currentMode === 'SELECT' || store.currentMode === 'TRANSFORM' || store.currentMode === 'CLIP') {
      return;
    }

    const pos = getCoordinates(e);

    if (store.currentMode === 'DRAW_POLYGON' || store.currentMode === 'DRAW_CURVE') {
      store.setIsDrawing(true);
      store.setTempPoints([...store.tempPoints, pos]);
      return;
    }

    store.setIsDrawing(true);
    store.setTempPoints([pos, pos]); // Start and end are same initially
  }, [store, getCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!store.isDrawing) return;

    const pos = getCoordinates(e);

    if (store.currentMode === 'DRAW_POLYGON' || store.currentMode === 'DRAW_CURVE') {
      return;
    }

    if (store.tempPoints.length >= 1) {
      store.setTempPoints([store.tempPoints[0], pos]);
    }
  }, [store, getCoordinates]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 2) return;

    if (store.currentMode === 'DRAW_POLYGON' || store.currentMode === 'DRAW_CURVE') {
      return;
    }

    if (!store.isDrawing || store.tempPoints.length < 2) {
      store.setIsDrawing(false);
      return;
    }

    const start = store.tempPoints[0];
    const end = store.tempPoints[1];

    let type: ShapeType = 'LINE';
    if (store.currentMode === 'DRAW_CIRCLE') type = 'CIRCLE';

    const newShape: Shape = {
      id: uuidv4(),
      type,
      points: [start, end],
      color: store.currentColor,
      algorithm: store.currentAlgorithm as any
    };

    store.addShape(newShape);
    store.setIsDrawing(false);
    store.setTempPoints([]);
  }, [store]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (store.currentMode === 'DRAW_POLYGON' || store.currentMode === 'DRAW_CURVE') {
      if (store.tempPoints.length >= 2) {
        const type: ShapeType = store.currentMode === 'DRAW_POLYGON' ? 'POLYGON' : 'CURVE';
        const newShape: Shape = {
          id: uuidv4(),
          type,
          points: store.tempPoints,
          color: store.currentColor,
          algorithm: store.currentAlgorithm as any
        };
        store.addShape(newShape);
      }
      store.setIsDrawing(false);
      store.setTempPoints([]);
    }
  }, [store]);

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu
  };
};
