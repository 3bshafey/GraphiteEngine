import type { Camera } from './Camera';

export const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, camera: Camera, cellSize: number) => {
  ctx.save();
  
  // Transform to center and apply pan
  const centerX = width / 2;
  const centerY = height / 2;
  
  ctx.translate(centerX, centerY);
  ctx.translate(camera.x, camera.y);
  // We do NOT apply camera.scale because the grid uses cellSize.

  // Draw light gray grid
  ctx.strokeStyle = '#334155'; // slate-700
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  // Calculate bounds to fill the screen even when panned
  const left = -centerX - camera.x;
  const right = width - centerX - camera.x;
  const top = -centerY - camera.y;
  const bottom = height - centerY - camera.y;
  
  // Find starting x and y aligned to cellSize
  const startX = Math.floor(left / cellSize) * cellSize;
  const startY = Math.floor(top / cellSize) * cellSize;

  for (let x = startX; x <= right; x += cellSize) {
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let y = startY; y <= bottom; y += cellSize) {
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();

  // Draw X and Y axis in darker gray, slightly thicker
  ctx.strokeStyle = '#94a3b8'; // slate-400
  ctx.lineWidth = 2;
  ctx.beginPath();
  // X axis
  if (top <= 0 && bottom >= 0) {
    ctx.moveTo(left, 0);
    ctx.lineTo(right, 0);
  }
  // Y axis
  if (left <= 0 && right >= 0) {
    ctx.moveTo(0, top);
    ctx.lineTo(0, bottom);
  }
  ctx.stroke();

  // Label the axis numbers every 5 units
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // X axis labels
  for (let x = startX; x <= right; x += cellSize) {
    const unitX = x / cellSize;
    if (unitX !== 0 && unitX % 5 === 0) {
      ctx.fillText(unitX.toString(), x, 12);
    }
  }
  
  // Y axis labels (Y is flipped in math, so -unitY)
  for (let y = startY; y <= bottom; y += cellSize) {
    const unitY = -y / cellSize;
    if (unitY !== 0 && unitY % 5 === 0) {
      ctx.fillText(unitY.toString(), -12, y);
    }
  }

  ctx.restore();
};
