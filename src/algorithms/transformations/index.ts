import type { Point } from '../../types';

export const translate = (points: Point[], tx: number, ty: number): Point[] => {
  return points.map(p => ({
    x: p.x + tx,
    y: p.y + ty
  }));
};

export const scale = (points: Point[], sx: number, sy: number, center: Point): Point[] => {
  return points.map(p => ({
    x: Math.round(center.x + (p.x - center.x) * sx),
    y: Math.round(center.y + (p.y - center.y) * sy)
  }));
};

export const rotate = (points: Point[], angleInDegrees: number, center: Point): Point[] => {
  const rad = (angleInDegrees * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  return points.map(p => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return {
      x: Math.round(center.x + dx * cosA - dy * sinA),
      y: Math.round(center.y + dx * sinA + dy * cosA)
    };
  });
};

export const reflectX = (points: Point[], centerY: number): Point[] => {
  return points.map(p => ({
    x: p.x,
    y: centerY - (p.y - centerY)
  }));
};

export const reflectY = (points: Point[], centerX: number): Point[] => {
  return points.map(p => ({
    x: centerX - (p.x - centerX),
    y: p.y
  }));
};

export const shear = (points: Point[], shx: number, shy: number, center: Point): Point[] => {
  return points.map(p => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return {
      x: Math.round(center.x + dx + shx * dy),
      y: Math.round(center.y + dy + shy * dx)
    };
  });
};
