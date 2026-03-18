import type { Point } from "./types";
import { words } from "./words.ts";

export const getNormalizedPointFromReal = (
  point: Point,
  canvas: HTMLCanvasElement,
): Point => {
  if (canvas.width <= 0 || canvas.height <= 0) {
    return { x: 0, y: 0 };
  }

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

    if (!data || !data.length) {
      throw new Error("Пустой ответ");
    }

    return data[0];
  } catch (error) {
    console.error(error);

    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }
};
