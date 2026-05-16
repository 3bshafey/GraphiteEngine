import type { Point } from '../../types';

export const midpointCircle = (center: Point, radius: number): Point[] => {
  const points: Point[] = [];
  const xc = Math.round(center.x);
  const yc = Math.round(center.y);
  const r = Math.round(radius);

  let x = 0;
  let y = r;
  let p = 1 - r;

  const addSymmetricPoints = (xc: number, yc: number, x: number, y: number) => {
    points.push({ x: xc + x, y: yc + y });
    points.push({ x: xc - x, y: yc + y });
    points.push({ x: xc + x, y: yc - y });
    points.push({ x: xc - x, y: yc - y });
    points.push({ x: xc + y, y: yc + x });
    points.push({ x: xc - y, y: yc + x });
    points.push({ x: xc + y, y: yc - x });
    points.push({ x: xc - y, y: yc - x });
  };

  while (x < y) {
    addSymmetricPoints(xc, yc, x, y);
    x++;
    if (p < 0) {
      p += 2 * x + 1;
    } else {
      y--;
      p += 2 * (x - y) + 1;
    }
  }

  return points;
};
