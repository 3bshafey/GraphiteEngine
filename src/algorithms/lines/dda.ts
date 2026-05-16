import type { Point } from '../../types';

export const dda = (start: Point, end: Point): Point[] => {
  const points: Point[] = [];
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  if (steps === 0) {
    return [{ x: Math.round(start.x), y: Math.round(start.y) }];
  }

  const xIncrement = dx / steps;
  const yIncrement = dy / steps;

  let x = start.x;
  let y = start.y;

  for (let i = 0; i <= steps; i++) {
    points.push({ x: Math.round(x), y: Math.round(y) });
    x += xIncrement;
    y += yIncrement;
  }

  return points;
};
