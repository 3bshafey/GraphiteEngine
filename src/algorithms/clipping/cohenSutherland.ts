import type { Point } from '../../types';

const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

const computeCode = (x: number, y: number, xMin: number, yMin: number, xMax: number, yMax: number): number => {
  let code = INSIDE;
  if (x < xMin) code |= LEFT;
  else if (x > xMax) code |= RIGHT;
  if (y < yMin) code |= BOTTOM; // Note: if y goes down, top and bottom might be swapped depending on coordinate system
  else if (y > yMax) code |= TOP;
  return code;
};

export const cohenSutherland = (start: Point, end: Point, xMin: number, yMin: number, xMax: number, yMax: number): { start: Point, end: Point } | null => {
  let { x: x1, y: y1 } = start;
  let { x: x2, y: y2 } = end;
  
  // Ensure correct min/max bounds
  const realXMin = Math.min(xMin, xMax);
  const realXMax = Math.max(xMin, xMax);
  const realYMin = Math.min(yMin, yMax);
  const realYMax = Math.max(yMin, yMax);

  let code1 = computeCode(x1, y1, realXMin, realYMin, realXMax, realYMax);
  let code2 = computeCode(x2, y2, realXMin, realYMin, realXMax, realYMax);
  let accept = false;

  while (true) {
    if ((code1 === 0) && (code2 === 0)) {
      accept = true;
      break;
    } else if ((code1 & code2) !== 0) {
      break;
    } else {
      let codeOut = code1 !== 0 ? code1 : code2;
      let x = 0;
      let y = 0;

      if ((codeOut & TOP) !== 0) {
        x = x1 + (x2 - x1) * (realYMax - y1) / (y2 - y1);
        y = realYMax;
      } else if ((codeOut & BOTTOM) !== 0) {
        x = x1 + (x2 - x1) * (realYMin - y1) / (y2 - y1);
        y = realYMin;
      } else if ((codeOut & RIGHT) !== 0) {
        y = y1 + (y2 - y1) * (realXMax - x1) / (x2 - x1);
        x = realXMax;
      } else if ((codeOut & LEFT) !== 0) {
        y = y1 + (y2 - y1) * (realXMin - x1) / (x2 - x1);
        x = realXMin;
      }

      if (codeOut === code1) {
        x1 = x;
        y1 = y;
        code1 = computeCode(x1, y1, realXMin, realYMin, realXMax, realYMax);
      } else {
        x2 = x;
        y2 = y;
        code2 = computeCode(x2, y2, realXMin, realYMin, realXMax, realYMax);
      }
    }
  }

  if (accept) {
    return { start: { x: Math.round(x1), y: Math.round(y1) }, end: { x: Math.round(x2), y: Math.round(y2) } };
  }
  return null;
};
