import type { Camera } from './Camera';
import type { Point } from '../../types';

export const screenToWorld = (screenX: number, screenY: number, camera: Camera): Point => {
  return {
    x: (screenX - camera.x) / camera.scale,
    y: (screenY - camera.y) / camera.scale,
  };
};

export const worldToScreen = (worldX: number, worldY: number, camera: Camera): Point => {
  return {
    x: worldX * camera.scale + camera.x,
    y: worldY * camera.scale + camera.y,
  };
};
