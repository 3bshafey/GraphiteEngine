import type { Point } from '../../types';

export const bresenhamCircle = (center: Point, radius: number): Point[] => {
  const points: Point[] = [];
  const xc = Math.round(center.x);
  const yc = Math.round(center.y);
  const r = Math.round(radius);

  let x = 0;
  let y = r;
  let d = 3 - 2 * r;

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

  while (y >= x) {
    addSymmetricPoints(xc, yc, x, y);
    x++;
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
  }

  return points;
};
