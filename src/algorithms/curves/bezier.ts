import type { Point } from '../../types';

export const bezierCurve = (controlPoints: Point[], numSegments: number = 100): Point[] => {
  const points: Point[] = [];
  
  if (controlPoints.length < 2) return points;

  // Function to calculate factorial
  const fact = (n: number): number => {
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    return f;
  };

  // Binomial coefficient
  const comb = (n: number, k: number): number => {
    return fact(n) / (fact(k) * fact(n - k));
  };

  const n = controlPoints.length - 1;

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    let x = 0;
    let y = 0;

    for (let i = 0; i <= n; i++) {
      const b = comb(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
      x += b * controlPoints[i].x;
      y += b * controlPoints[i].y;
    }

    points.push({ x: Math.round(x), y: Math.round(y) });
  }

  return points;
};
