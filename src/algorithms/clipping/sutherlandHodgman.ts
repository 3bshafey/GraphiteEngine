import type { Point } from '../../types';

// Helper to determine if point is inside an edge
const isInside = (p: Point, edgeStart: Point, edgeEnd: Point): boolean => {
  return (edgeEnd.x - edgeStart.x) * (p.y - edgeStart.y) > (edgeEnd.y - edgeStart.y) * (p.x - edgeStart.x);
};

// Helper to calculate intersection
const computeIntersection = (s: Point, e: Point, edgeStart: Point, edgeEnd: Point): Point => {
  const dc = { x: edgeStart.x - edgeEnd.x, y: edgeStart.y - edgeEnd.y };
  const dp = { x: s.x - e.x, y: s.y - e.y };
  
  const n1 = edgeStart.x * edgeEnd.y - edgeStart.y * edgeEnd.x;
  const n2 = s.x * e.y - s.y * e.x;
  
  const n3 = 1.0 / (dc.x * dp.y - dc.y * dp.x);
  
  return {
    x: Math.round((n1 * dp.x - n2 * dc.x) * n3),
    y: Math.round((n1 * dp.y - n2 * dc.y) * n3)
  };
};

export const sutherlandHodgman = (polygon: Point[], clipPolygon: Point[]): Point[] => {
  let outputList = polygon;
  
  for (let i = 0; i < clipPolygon.length; i++) {
    const edgeStart = clipPolygon[i];
    const edgeEnd = clipPolygon[(i + 1) % clipPolygon.length];
    
    const inputList = outputList;
    outputList = [];
    
    if (inputList.length === 0) break;
    
    let s = inputList[inputList.length - 1];
    
    for (let j = 0; j < inputList.length; j++) {
      const e = inputList[j];
      
      if (isInside(e, edgeStart, edgeEnd)) {
        if (!isInside(s, edgeStart, edgeEnd)) {
          outputList.push(computeIntersection(s, e, edgeStart, edgeEnd));
        }
        outputList.push(e);
      } else if (isInside(s, edgeStart, edgeEnd)) {
        outputList.push(computeIntersection(s, e, edgeStart, edgeEnd));
      }
      
      s = e;
    }
  }
  
  return outputList;
};
