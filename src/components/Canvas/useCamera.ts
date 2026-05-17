import { useCallback, useRef, useState } from 'react';
import type { Camera } from './Camera';

const DEFAULT_CAMERA: Camera = { x: 0, y: 0, scale: 1 };

export const useCamera = () => {
  const [camera, setCamera] = useState<Camera>({ ...DEFAULT_CAMERA });
  const isPanningRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  /** Begin a pan gesture at screen position (x, y) */
  const startPan = useCallback((x: number, y: number) => {
    isPanningRef.current = true;
    lastPosRef.current = { x, y };
    setIsPanning(true);
  }, []);

  /** Continue pan to new screen position */
  const pan = useCallback((x: number, y: number) => {
    if (!isPanningRef.current || !lastPosRef.current) return;
    const dx = x - lastPosRef.current.x;
    const dy = y - lastPosRef.current.y;
    lastPosRef.current = { x, y };
    setCamera(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  /** Pan by an explicit delta (useful for keyboard arrow keys) */
  const panBy = useCallback((dx: number, dy: number) => {
    setCamera(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  /** End the current pan gesture */
  const endPan = useCallback(() => {
    isPanningRef.current = false;
    lastPosRef.current = null;
    setIsPanning(false);
  }, []);

  /** Zoom around a screen pivot point */
  const zoom = useCallback((delta: number, pivotX: number, pivotY: number) => {
    setCamera(prev => {
      const factor = delta > 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.1, Math.min(20, prev.scale * factor));
      // Keep the pivot point fixed in world space
      const wx = (pivotX - prev.x) / prev.scale;
      const wy = (pivotY - prev.y) / prev.scale;
      return {
        x: pivotX - wx * newScale,
        y: pivotY - wy * newScale,
        scale: newScale,
      };
    });
  }, []);

  const resetCamera = useCallback(() => {
    setCamera({ ...DEFAULT_CAMERA });
  }, []);

  return { camera, startPan, pan, panBy, endPan, zoom, resetCamera, isPanning };
};
