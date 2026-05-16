export interface Point {
  x: number;
  y: number;
}

export type ShapeType = 'LINE' | 'CIRCLE' | 'CURVE' | 'POLYGON';
export type LineAlgorithm = 'DDA' | 'BRESENHAM';
export type CircleAlgorithm = 'MIDPOINT' | 'BRESENHAM';
export type CurveAlgorithm = 'BEZIER' | 'B_SPLINE';
export type ClippingAlgorithm = 'COHEN_SUTHERLAND' | 'SUTHERLAND_HODGMAN';

export type TransformationType = 'TRANSLATION' | 'ROTATION' | 'SCALING' | 'REFLECTION' | 'SHEARING';

export interface Shape {
  id: string;
  type: ShapeType;
  points: Point[]; // Represents control points, vertices, etc.
  color: string;
  algorithm: LineAlgorithm | CircleAlgorithm | CurveAlgorithm;
  fill?: string;
  lineWidth?: number;
  // For circles, points[0] is center, points[1] is a point on the circle.
  // For lines, points[0] is start, points[1] is end.
  // For curves, points are control points.
  // For polygons, points are vertices.
}

export interface DrawingState {
  shapes: Shape[];
  selectedShapeId: string | null;
  currentMode: 'SELECT' | 'DRAW_LINE' | 'DRAW_CIRCLE' | 'DRAW_CURVE' | 'DRAW_POLYGON' | 'CLIP' | 'TRANSFORM';
  currentAlgorithm: LineAlgorithm | CircleAlgorithm | CurveAlgorithm | ClippingAlgorithm;
  currentColor: string;
  theme: 'dark' | 'light';
  isDragging: boolean;
}
