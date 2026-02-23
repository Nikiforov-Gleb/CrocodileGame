import "../styles/styles.css";
import { useEffect, useRef, useState } from "react";

export const Canvas = () =>
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setDrawingState] = useState(false);
    const [lastPos, setLastPos] = useState<{x: number, y: number} | null>(null);

    useEffect(() => 
    {
        const canvas = canvasRef.current!;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        ctxRef.current = ctx;

        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.9;
    }, []
    );

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setDrawingState(true);
        setLastPos(getMousePos(e));
    };

    const stopDrawing = () => {
        setDrawingState(false);
        setLastPos(null);
    };

    const drawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !lastPos || !ctxRef.current) return;
        const pos = getMousePos(e);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(lastPos.x, lastPos.y);
        ctxRef.current.lineTo(pos.x, pos.y);
        ctxRef.current.stroke();

        setLastPos(pos);
    }; 

      const clearCanvas = () => {
        if (!ctxRef.current || !canvasRef.current) return;
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    return(
    <div className="canvas-container">
        <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={drawing}
        />
        <button className="clear-button" onClick={clearCanvas}>Очистить</button>
    </div>
    );
};

export default Canvas;