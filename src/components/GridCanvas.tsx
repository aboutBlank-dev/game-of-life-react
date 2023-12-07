import React, { useEffect, useRef, useState } from "react";
import { GridCell } from "../Game";

type Props = {
  gridCells: GridCell[][];
};

function Canvas(
  { gridCells }: Props,
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const gridSize = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const cellSize =
      (windowWidth > windowHeight ? windowWidth : windowHeight) / gridSize;

    for (let i = 0; i < gridCells.length; i++) {
      for (let j = 0; j < gridCells[i].length; j++) {
        const cell = gridCells[i][j];
        ctx.fillStyle = cell.alive ? "black" : "white";
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        ctx.strokeRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }, [windowHeight, windowWidth, gridCells]);

  useEffect(() => {
    const setWindowSizes = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", setWindowSizes);

    return () => {
      window.removeEventListener("resize", setWindowSizes);
    };
  });

  return (
    <canvas
      ref={canvasRef}
      width={windowWidth}
      height={windowHeight}
      {...props}
    />
  );
}

export default Canvas;
