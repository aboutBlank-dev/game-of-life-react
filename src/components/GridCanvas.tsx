import React, { useEffect, useRef, useState } from "react";

export type GridCell = {
  x: number;
  y: number;
  alive: boolean;
};

type Props = {
  gridSize: number;
  gridCells: GridCell[][];
  onCellClicked: (x: number, y: number) => void;
};

function Canvas(
  { gridSize, gridCells, onCellClicked }: Props,
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasContainerDimensions, setCanvasContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set canvas container dimensions on mount
  useEffect(() => {
    setCanvasContainerDimensions({
      width: canvasContainerRef.current?.clientWidth || 0,
      height: canvasContainerRef.current?.clientHeight || 0,
    });
  }, [canvasContainerRef]);

  // Set canvas container dimensions on resize
  useEffect(() => {
    const updateCanvasContainerDimensions = () => {
      setCanvasContainerDimensions({
        width: canvasContainerRef.current?.clientWidth || 0,
        height: canvasContainerRef.current?.clientHeight || 0,
      });
    };

    window.addEventListener("resize", updateCanvasContainerDimensions);

    return () => {
      window.removeEventListener("resize", updateCanvasContainerDimensions);
    };
  });

  //Draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize =
      (canvasContainerDimensions.width > canvasContainerDimensions.height
        ? canvasContainerDimensions.width
        : canvasContainerDimensions.height) / gridSize;

    for (let i = 0; i < gridCells.length; i++) {
      for (let j = 0; j < gridCells[i].length; j++) {
        const cell = gridCells[i][j];
        ctx.fillStyle = cell.alive ? "black" : "white";

        if (cell.y * cellSize > canvasContainerDimensions.height) continue;
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        ctx.strokeRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }, [canvasContainerDimensions, gridCells, gridSize]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    const cellSize =
      (canvasContainerDimensions.width > canvasContainerDimensions.height
        ? canvasContainerDimensions.width
        : canvasContainerDimensions.height) / gridSize;

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

  console.log(
    "rendering canvas with widht/height",
    canvasContainerDimensions.width,
    canvasContainerDimensions.height
  );
  return (
    <div className='w-full h-full' ref={canvasContainerRef}>
      <canvas
        className='inset-0 mx-auto my-auto'
        ref={canvasRef}
        width={canvasContainerDimensions.width}
        height={canvasContainerDimensions.height}
        onClick={handleClick}
        {...props}
      />
    </div>
  );
}

export default Canvas;
