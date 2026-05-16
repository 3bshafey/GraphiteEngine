import { useState, useCallback, useRef } from 'react';
import type { Camera } from './Camera';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_SENSITIVITY = 0.001;

export const useCamera = () => {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const startPan = useCallback((screenX: number, screenY: number) => {
    isPanningRef.current = true;
    setIsPanning(true);
    lastMousePos.current = { x: screenX, y: screenY };
  }, []);

  const pan = useCallback((screenX: number, screenY: number) => {
    if (!isPanningRef.current) return;
    
    setCamera(prev => {
      // Fix zoom-aware movement (adjust pan speed based on scale)
      const dx = (screenX - lastMousePos.current.x) / prev.scale;
      const dy = (screenY - lastMousePos.current.y) / prev.scale;
      
      return {
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      };
    });
    
    lastMousePos.current = { x: screenX, y: screenY };
  }, []);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
    setIsPanning(false);
  }, []);

  const zoom = useCallback((screenX: number, screenY: number, deltaY: number) => {
    setCamera(prev => {
      // Exponential zoom
      const zoomFactor = Math.exp(-deltaY * ZOOM_SENSITIVITY);
      let newScale = prev.scale * zoomFactor;
      
      // Clamp zoom
      newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
      
      // We want to zoom towards the mouse cursor.
      // This means the world coordinates under the mouse cursor should remain the same before and after zoom.
      // screenX = worldX * oldScale + oldX
      // worldX = (screenX - oldX) / oldScale
      // We want: screenX = worldX * newScale + newX
      // newX = screenX - worldX * newScale = screenX - ((screenX - oldX) / oldScale) * newScale
      
      const newX = screenX - ((screenX - prev.x) / prev.scale) * newScale;
      const newY = screenY - ((screenY - prev.y) / prev.scale) * newScale;

      return {
        x: newX,
        y: newY,
        scale: newScale
      };
    });
  }, []);

  const resetCamera = useCallback(() => {
    setCamera({ x: 0, y: 0, scale: 1 });
  }, []);

  return {
    camera,
    startPan,
    pan,
    endPan,
    zoom,
    resetCamera,
    isPanning
  };
};
