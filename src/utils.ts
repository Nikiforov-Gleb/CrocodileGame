import type { Point } from "./types";

export const getNormalizedPointFromReal = (
  point: Point,
  canvas: HTMLCanvasElement,
): Point => {
  return {
    x: point.x / canvas.width,
    y: point.y / canvas.height,
  };
};

export const getRealPointFromNormalized = (
  point: Point,
  canvas: HTMLCanvasElement,
): Point => {
  return {
    x: point.x * canvas.width,
    y: point.y * canvas.height,
  };
};
