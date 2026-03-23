import type { Point } from "../types.ts";
import { socket } from "../server/socket.ts";
import { getNormalizedPointFromReal } from "../utils.ts";

export const createCanvasActions = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>,
  lastPosRef: { current: Point | null },
  isDrawingRef: { current: boolean },
  lang: string,
) => {
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    needEmit?: boolean,
  ) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (needEmit) {
      if (!canvasRef || !canvasRef.current) return;
      const canvas = canvasRef.current;

      const normStart: Point = getNormalizedPointFromReal(start, canvas);
      const normEnd: Point = getNormalizedPointFromReal(end, canvas);

      socket.emit("drawing", [normStart, normEnd], lang);
    }
  };

  const drawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const lastPos = lastPosRef.current;
    if (!isDrawingRef.current || !lastPos || !ctxRef.current) return;
    const pos = getMousePos(e);

    if (pos) {
      drawLine(ctxRef.current, lastPos, pos, true);
      lastPosRef.current = pos;
    }
  };

  const clearCanvas = (needEmit?: boolean) => {
    if (!ctxRef.current || !canvasRef.current) return;
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    if (needEmit) {
      socket.emit("clearCanvas", lang);
    }
  };

  return {
    startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = true;
      const pos = getMousePos(e);
      if (pos) lastPosRef.current = pos;
    },
    stopDrawing: () => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    },
    drawing,
    drawLine,
    clearCanvas,
  };
};
