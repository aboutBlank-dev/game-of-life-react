import React, { useEffect, useRef, useState } from "react";
import { GridCell } from "../Game";

type Props = {
  reservedBottomSpace: number;
  gridSize: number;
  gridCells: GridCell[][];
  onCellClicked: (x: number, y: number) => void;
};

function Canvas(
  { reservedBottomSpace, gridSize, gridCells, onCellClicked }: Props,
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize =
      (windowWidth > windowHeight ? windowWidth : windowHeight) / gridSize;

    for (let i = 0; i < gridCells.length; i++) {
      for (let j = 0; j < gridCells[i].length; j++) {
        const cell = gridCells[i][j];
        ctx.fillStyle = cell.alive ? "black" : "white";

        if (cell.y * cellSize + cellSize > windowHeight - reservedBottomSpace)
          continue;
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        ctx.strokeRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }, [windowHeight, windowWidth, gridCells, gridSize]);

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

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    const cellSize =
      (windowWidth > windowHeight ? windowWidth : windowHeight) / gridSize;

    for (let y = 0; y < gridCells.length; y++) {
      for (let x = 0; x < gridCells[y].length; x++) {
        const cell = gridCells[y][x];
        if (
          mouseX >= cell.x * cellSize &&
          mouseX <= cell.x * cellSize + cellSize &&
          mouseY >= cell.y * cellSize &&
          mouseY <= cell.y * cellSize + cellSize
        ) {
          onCellClicked(x, y);
        }
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={windowWidth}
      height={windowHeight}
      onClick={handleClick}
      {...props}
    />
  );
}

export default Canvas;
