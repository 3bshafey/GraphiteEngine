import type { Shape, Point } from '../../types';
import { dda } from '../../algorithms/lines/dda';
import { bresenhamLine } from '../../algorithms/lines/bresenham';
import { midpointCircle } from '../../algorithms/circles/midpoint';
import { bresenhamCircle } from '../../algorithms/circles/bresenham';
import { bezierCurve } from '../../algorithms/curves/bezier';
import { bSplineCurve } from '../../algorithms/curves/bSpline';

const drawPoints = (ctx: CanvasRenderingContext2D, points: Point[], color: string, glow: boolean = false) => {
  if (!points || points.length === 0) return;
  ctx.save();
  ctx.fillStyle = color;
  
  if (glow) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
  }

  for (const p of points) {
    ctx.fillRect(p.x, p.y, 2, 2); // 2x2 in world space
  }
  ctx.restore();
};

export const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  const { type, points, color, algorithm } = shape;
  
  if (type === 'LINE') {
    const p = algorithm === 'DDA' 
      ? dda(points[0], points[1]) 
      : bresenhamLine(points[0], points[1]);
    drawPoints(ctx, p, color, true);
  } else if (type === 'CIRCLE') {
    const radius = Math.sqrt(
      Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2)
    );
    const p = algorithm === 'MIDPOINT'
      ? midpointCircle(points[0], radius)
      : bresenhamCircle(points[0], radius);
    drawPoints(ctx, p, color, true);
  } else if (type === 'CURVE') {
    const p = algorithm === 'BEZIER'
      ? bezierCurve(points)
      : bSplineCurve(points);
    drawPoints(ctx, p, color, true);
    
    // Draw control polygon for curves
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5 / ctx.getTransform().a, 5 / ctx.getTransform().a]); // Adjust dash for scale
    ctx.strokeStyle = `${color}60`; // semi-transparent
    ctx.lineWidth = 1 / ctx.getTransform().a;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Draw control points
    ctx.fillStyle = color;
    const pointScale = 1 / ctx.getTransform().a;
    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4 * pointScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8 * pointScale, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}80`;
      ctx.stroke();
    }
    ctx.restore();
  } else if (type === 'POLYGON') {
    if (points.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / ctx.getTransform().a;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Fill with very transparent color
    ctx.fillStyle = `${color}10`;
    ctx.fill();
    ctx.restore();
  }
};
