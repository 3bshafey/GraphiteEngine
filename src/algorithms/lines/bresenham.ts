import type { Point } from '../../types';

export const bresenhamLine = (start: Point, end: Point): Point[] => {
  const points: Point[] = [];
  
  let x1 = Math.round(start.x);
  let y1 = Math.round(start.y);
  const x2 = Math.round(end.x);
  const y2 = Math.round(end.y);

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  
  let err = dx - dy;

  while (true) {
    points.push({ x: x1, y: y1 });
    
    if (x1 === x2 && y1 === y2) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }

  return points;
};
