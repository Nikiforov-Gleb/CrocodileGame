import "../styles/game-styles.css";
import { socket } from "../server/socket.ts";
import { useEffect, useRef } from "react";
import { createCanvasActions } from "./canvasActions.ts";
import type { Point } from "../types.ts";
import { getRealPointFromNormalized } from "../utils.ts";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store.ts";

interface CanvasProps {
  getMethods?: (clearCanvas: () => void) => void;
}

export const Canvas = ({ getMethods }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<Point | null>(null);
  const canvasActionRef = useRef<ReturnType<typeof createCanvasActions> | null>(
    null,
  );

  const canDraw = useSelector((state: RootState) => state.gameflow.isHost);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctxRef.current = ctx;

    canvasActionRef.current = createCanvasActions(
      canvasRef,
      ctxRef,
      lastPosRef,
      isDrawingRef,
    );

    const handleResize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (getMethods && canvasActionRef.current)
      getMethods(() => canvasActionRef.current!.clearCanvas);

    socket.on("drawing", ([start, end]: [Point, Point]) => {
      if (!canvasActionRef.current) return;
      const realStart: Point = getRealPointFromNormalized(start, canvas);
      const realEnd: Point = getRealPointFromNormalized(end, canvas);

      canvasActionRef.current.drawLine(ctx, realStart, realEnd);
    });

    socket.on("clearCanvas", () => {
      canvasActionRef.current?.clearCanvas(false);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("drawing");
    };
  }, [getMethods]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => canDraw && canvasActionRef.current?.startDrawing(e)}
        onMouseUp={() => canDraw && canvasActionRef.current?.stopDrawing()}
        onMouseLeave={() => canDraw && canvasActionRef.current?.stopDrawing()}
        onMouseMove={(e) => canDraw && canvasActionRef.current?.drawing(e)}
      />
    </div>
  );
};

export default Canvas;
