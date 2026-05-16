import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useStore } from '../../store/useStore';
import type { Camera } from './Camera';
import { drawGrid } from './gridRenderer';
import { drawShape } from './shapeRenderer';
import type { Shape } from '../../types';

export const useCanvasRenderer = (canvasRef: RefObject<HTMLCanvasElement | null>, camera: Camera, isActive: boolean) => {
  const store = useStore();

  useEffect(() => {
    if (!isActive) return;
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas entirely
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw premium grid (Screen space, but reacts to camera)
      drawGrid(ctx, canvas.width, canvas.height, camera, store.cellSize);

      // 2. Apply Camera Transform for Shapes
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      // Draw all shapes in world coordinates
      for (const shape of store.shapes) {
        drawShape(ctx, shape);
      }

      // Draw preview
      if (store.isDrawing && store.tempPoints.length > 0) {
        if (store.currentMode === 'DRAW_LINE' || store.currentMode === 'DRAW_CIRCLE') {
          const previewShape: Shape = {
            id: 'preview',
            type: store.currentMode === 'DRAW_LINE' ? 'LINE' : 'CIRCLE',
            points: store.tempPoints,
            color: store.currentColor,
            algorithm: store.currentAlgorithm as any
          };
          drawShape(ctx, previewShape);
        } else if (store.currentMode === 'DRAW_POLYGON' || store.currentMode === 'DRAW_CURVE') {
          // Draw temporary control points
          ctx.fillStyle = store.currentColor;
          ctx.shadowBlur = 8 / camera.scale;
          ctx.shadowColor = store.currentColor;
          for (const p of store.tempPoints) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 / camera.scale, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          
          // Connect them lightly
          if (store.tempPoints.length > 1) {
            ctx.beginPath();
            ctx.setLineDash([4 / camera.scale, 4 / camera.scale]);
            ctx.strokeStyle = `${store.currentColor}80`;
            ctx.lineWidth = 1 / camera.scale;
            ctx.moveTo(store.tempPoints[0].x, store.tempPoints[0].y);
            for (let i = 1; i < store.tempPoints.length; i++) {
              ctx.lineTo(store.tempPoints[i].x, store.tempPoints[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }



      // Restore context to screen space
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [store.shapes, store.tempPoints, store.isDrawing, store.currentColor, camera, isActive]);
};
