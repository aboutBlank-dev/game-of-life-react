import React, { useEffect, useRef, useState } from "react";

export type GridCell = {
  x: number;
  y: number;
};

type Props = {
  cellSize: number;
  gridCells: GridCell[][];
  onCellClicked: (x: number, y: number) => void;
  onGridSizeChanged: (width: number, height: number) => void;
  preCellDraw: (cell: GridCell, ctx: CanvasRenderingContext2D) => void;
};

function Canvas(
  {
    cellSize,
    gridCells,
    onCellClicked,
    onGridSizeChanged,
    preCellDraw: onCellWillBeDrawn,
  }: Props,
  props: React.CanvasHTMLAttributes<HTMLCanvasElement>
) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasContainerDimensions, setCanvasContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //For Panning/Dragging
  const isMouseDown = useRef(false);
  const startMousePosition = useRef({ x: 0, y: 0 });
  const canvasOffset = useRef({ x: 0, y: 0 });

  // Set canvas container dimensions on mount
  useEffect(() => {
    setCanvasContainerDimensions({
      width: canvasContainerRef.current?.clientWidth || 0,
      height: canvasContainerRef.current?.clientHeight || 0,
    });
  }, [canvasContainerRef]);

  useEffect(() => {
    //calculate how many cells fit in the canvas container
    const width = Math.floor(canvasContainerDimensions.width / cellSize);
    const height = Math.floor(canvasContainerDimensions.height / cellSize);
    onGridSizeChanged(width, height);
  }, [canvasContainerDimensions, cellSize]);

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

  //Draw grid when changes happen
  useEffect(() => {
    drawGrid();
  }, [gridCells, canvasOffset]);

  const drawGrid = () => {
    if (gridCells.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = canvasOffset.current.x;
    const offsetY = canvasOffset.current.y;

    for (let y = 0; y < gridCells.length; y++) {
      for (let x = 0; x < gridCells[y].length; x++) {
        const cell = gridCells[y][x];

        onCellWillBeDrawn(cell, ctx);
        ctx.fillRect(
          cell.x * cellSize + offsetX,
          cell.y * cellSize + offsetY,
          cellSize,
          cellSize
        );
      }
    }

    const height = gridCells.length * cellSize;
    const width = gridCells[0].length * cellSize;

    //Draw infinite vertical lines based on the panning
    ctx.beginPath();
    const gridOffsetX = offsetX % cellSize;
    const gridOffsetY = offsetY % cellSize;

    //infinite grid lines
    for (let x = gridOffsetX; x < width; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = gridOffsetY; y < height; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    const offsetX = canvasOffset.current.x;
    const offsetY = canvasOffset.current.y;

    for (let y = 0; y < gridCells.length; y++) {
      for (let x = 0; x < gridCells[y].length; x++) {
        const cell = gridCells[y][x];
        if (
          mouseX >= cell.x * cellSize + offsetX &&
          mouseX <= cell.x * cellSize + cellSize + offsetX &&
          mouseY >= cell.y * cellSize + offsetY &&
          mouseY <= cell.y * cellSize + cellSize + offsetY
        ) {
          onCellClicked(x, y);
          return;
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    startMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };

    isMouseDown.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    isMouseDown.current = false;
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // clear the isDragging flag
    isMouseDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // only do this code if the mouse is being dragged
    if (!isMouseDown.current) {
      return;
    }

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // dx & dy are the distance the mouse has moved since
    // the last mousemove event
    var change = {
      x: mouseX - startMousePosition.current.x,
      y: mouseY - startMousePosition.current.y,
    };

    // reset the vars for next mousemove
    startMousePosition.current = {
      x: mouseX,
      y: mouseY,
    };

    // accumulate the net panning done
    canvasOffset.current = {
      x: canvasOffset.current.x + change.x,
      y: canvasOffset.current.y + change.y,
    };

    // redraw the scene with the new panning
    drawGrid();
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        {...props}
      />
    </div>
  );
}

export default Canvas;
