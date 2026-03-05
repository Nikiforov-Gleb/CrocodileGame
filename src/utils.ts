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

export const getRandomWord = async (): Promise<string> => {
  try {
    const res = await fetch(
      "https://random-word-api.herokuapp.com/word?number=1&diff=1",
    );
    if (!res.ok) {
      throw new Error("Ошибка запроса");
    }
    const data: string[] = await res.json();
    return data[0];
  } catch (error) {
    console.error(error);
    return "";
  }
};
