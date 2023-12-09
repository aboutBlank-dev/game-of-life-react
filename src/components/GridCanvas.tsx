import React, { useEffect, useRef, useState } from "react";
import { GridCell } from "../Game";

type Props = {
  containerWidth: number;
  containerHeight: number;
  gridSize: number;
  gridCells: GridCell[][];
  onCellClicked: (x: number, y: number) => void;
};

function Canvas(
  {
    containerWidth,
    containerHeight,
    gridSize,
    gridCells,
    onCellClicked,
  }: Props,
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize =
      (containerWidth > containerHeight ? containerWidth : containerHeight) /
      gridSize;

    for (let i = 0; i < gridCells.length; i++) {
      for (let j = 0; j < gridCells[i].length; j++) {
        const cell = gridCells[i][j];
        ctx.fillStyle = cell.alive ? "black" : "white";

        if (cell.y * cellSize > containerHeight) continue;
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        ctx.strokeRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }, [containerHeight, containerWidth, gridCells, gridSize]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    const cellSize =
      (containerWidth > containerHeight ? containerWidth : containerHeight) /
      gridSize;

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
      className='inset-0 mx-auto my-auto'
      ref={canvasRef}
      width={containerWidth}
      height={containerHeight}
      onClick={handleClick}
      {...props}
    />
  );
}

export default Canvas;
