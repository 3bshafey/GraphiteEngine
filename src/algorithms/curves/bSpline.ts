import type { Point } from '../../types';

export const bSplineCurve = (controlPoints: Point[], degree: number = 3, numSegments: number = 100): Point[] => {
  const points: Point[] = [];
  const n = controlPoints.length;
  
  if (n < degree + 1) return points;

  // Knot vector
  const knots: number[] = [];
  const m = n + degree + 1;
  for (let i = 0; i < m; i++) {
    knots.push(i);
  }

  const N = (i: number, k: number, u: number): number => {
    if (k === 0) {
      return (u >= knots[i] && u < knots[i + 1]) ? 1 : 0;
    }
    
    const d1 = knots[i + k] - knots[i];
    const d2 = knots[i + k + 1] - knots[i + 1];
    
    let w1 = 0;
    if (d1 !== 0) w1 = ((u - knots[i]) / d1) * N(i, k - 1, u);
    
    let w2 = 0;
    if (d2 !== 0) w2 = ((knots[i + k + 1] - u) / d2) * N(i + 1, k - 1, u);
    
    return w1 + w2;
  };

  const tMin = knots[degree];
  const tMax = knots[n];

  for (let i = 0; i <= numSegments; i++) {
    // scale i to [tMin, tMax)
    // Using tMax - 0.0001 to avoid array out of bounds due to floating point.
    const t = tMin + (i / numSegments) * (tMax - tMin - 0.0001);
    
    let x = 0;
    let y = 0;
    
    for (let j = 0; j < n; j++) {
      const basis = N(j, degree, t);
      x += basis * controlPoints[j].x;
      y += basis * controlPoints[j].y;
    }
    
    points.push({ x: Math.round(x), y: Math.round(y) });
  }

  // Ensure last point is included properly depending on knot structure
  return points;
};
