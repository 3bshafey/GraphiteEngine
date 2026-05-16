import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useStore } from '../../store/useStore';
import type { Camera } from './Camera';
import { drawGrid } from './gridRenderer';

export const useAlgorithmCanvasRenderer = (canvasRef: RefObject<HTMLCanvasElement | null>, camera: Camera, isActive: boolean) => {
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

      // Draw Algorithm visualization
      if (store.algorithmType && store.algorithmPoints && store.algorithmPoints.length > 0) {
        ctx.save();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.translate(camera.x, camera.y);
        
        const cs = store.cellSize;

        // Draw points
        for (const pt of store.algorithmPoints) {
          const px = pt.x * cs;
          const py = -pt.y * cs; // flip Y
          
          // Determine if axis point (for coloring)
          let color = '#3b82f6'; // blue-500
          if (pt.x === 0 || pt.y === 0 || Math.abs(pt.x) === Math.abs(pt.y)) {
            color = '#eab308'; // yellow-500
          }
          
          ctx.fillStyle = color;
          // small filled square (CELL_SIZE-2 x CELL_SIZE-2)
          // centered at px, py
          const size = Math.max(1, cs - 2);
          ctx.fillRect(px - size/2, py - size/2, size, size);
        }

        // Draw shape outline
        if (store.algorithmType.includes('Line') || store.algorithmType === 'dda') {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)'; // thin gray line
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(store.algorithmPoints[0].x * cs, -store.algorithmPoints[0].y * cs);
          for (let i = 1; i < store.algorithmPoints.length; i++) {
            ctx.lineTo(store.algorithmPoints[i].x * cs, -store.algorithmPoints[i].y * cs);
          }
          ctx.stroke();
        }
        // Draw clipping window and original shape if applicable
        if (store.algorithmType === 'cohenSutherland' && store.algorithmParams) {
          const { x1, y1, x2, y2, xMin, yMin, xMax, yMax } = store.algorithmParams;
          // Original line
          ctx.strokeStyle = '#ef4444'; // red-500
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1 * cs, -y1 * cs);
          ctx.lineTo(x2 * cs, -y2 * cs);
          ctx.stroke();

          // Clip window
          ctx.strokeStyle = '#3b82f6'; // blue-500
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(xMin * cs, -yMax * cs, (xMax - xMin) * cs, (yMax - yMin) * cs);
          ctx.setLineDash([]);
        }

        if (store.algorithmType === 'sutherlandHodgman' && store.algorithmParams) {
          const { points, clipPoints } = store.algorithmParams;
          // Original polygon
          ctx.strokeStyle = '#ef4444'; // red-500
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (points.length > 0) {
            ctx.moveTo(points[0].x * cs, -points[0].y * cs);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x * cs, -points[i].y * cs);
            }
            ctx.closePath();
            ctx.stroke();
          }

          // Clip window
          ctx.strokeStyle = '#3b82f6'; // blue-500
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          if (clipPoints.length > 0) {
            ctx.moveTo(clipPoints[0].x * cs, -clipPoints[0].y * cs);
            for (let i = 1; i < clipPoints.length; i++) {
              ctx.lineTo(clipPoints[i].x * cs, -clipPoints[i].y * cs);
            }
            ctx.closePath();
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // For transformations
        const isTransform = ['translate', 'scale', 'rotate', 'reflectX', 'reflectY', 'shear'].includes(store.algorithmType);
        if (isTransform && store.algorithmParams && store.algorithmParams.points) {
          const originalPoints = store.algorithmParams.points;
          // Original shape in gray
          ctx.strokeStyle = '#94a3b8'; // gray-400
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (originalPoints.length > 0) {
            ctx.moveTo(originalPoints[0].x * cs, -originalPoints[0].y * cs);
            for (let i = 1; i < originalPoints.length; i++) {
              ctx.lineTo(originalPoints[i].x * cs, -originalPoints[i].y * cs);
            }
            if (originalPoints.length > 2) ctx.closePath();
            ctx.stroke();
          }

          // Transformed shape outline in blue
          ctx.strokeStyle = '#3b82f6'; // blue-500
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (store.algorithmPoints.length > 0) {
            ctx.moveTo(store.algorithmPoints[0].x * cs, -store.algorithmPoints[0].y * cs);
            for (let i = 1; i < store.algorithmPoints.length; i++) {
              ctx.lineTo(store.algorithmPoints[i].x * cs, -store.algorithmPoints[i].y * cs);
            }
            if (store.algorithmPoints.length > 2) ctx.closePath();
            ctx.stroke();
          }

          // Arrow from first point of original to first point of transformed
          if (originalPoints.length > 0 && store.algorithmPoints.length > 0) {
            const sx = originalPoints[0].x * cs;
            const sy = -originalPoints[0].y * cs;
            const ex = store.algorithmPoints[0].x * cs;
            const ey = -store.algorithmPoints[0].y * cs;
            
            ctx.strokeStyle = '#10b981'; // green-500
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            // Arrowhead
            const angle = Math.atan2(ey - sy, ex - sx);
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 10 * Math.cos(angle - Math.PI / 6), ey - 10 * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 10 * Math.cos(angle + Math.PI / 6), ey - 10 * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [store.algorithmType, store.algorithmPoints, store.algorithmParams, store.cellSize, camera, isActive]);
};
