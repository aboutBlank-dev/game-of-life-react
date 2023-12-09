import React, { useEffect, useRef, useState } from "react";

export type GridCell = {
  x: number;
  y: number;
  alive: boolean;
};

type Props = {
  cellSize: number;
  gridCells: GridCell[][];
  onCellClicked: (x: number, y: number) => void;
  onGridSizeChanged: (width: number, height: number) => void;
};

function Canvas(
  { cellSize, gridCells, onCellClicked, onGridSizeChanged }: Props,
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

  useEffect(() => {
    //calculate how many cells fit in the canvas container
    const width = Math.floor(canvasContainerDimensions.width / cellSize);
    const height = Math.floor(canvasContainerDimensions.height / cellSize);
    onGridSizeChanged(width, height);
  }, [canvasContainerDimensions, cellSize]);

  //Draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }, [canvasContainerDimensions, gridCells, cellSize]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

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
          return;
        }
      }
    }
  };

  const finalWidth =
    Math.floor(canvasContainerDimensions.width / cellSize) * cellSize;
  const finalHeight =
    Math.floor(canvasContainerDimensions.height / cellSize) * cellSize;
  return (
    <div className='relative w-full h-full' ref={canvasContainerRef}>
      <canvas
        className='absolute inset-0 my-auto mx-auto'
        ref={canvasRef}
        width={finalWidth}
        height={finalHeight}
        onClick={handleClick}
        {...props}
      />
    </div>
  );
}

export default Canvas;
