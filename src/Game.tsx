import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Canvas from "./components/GridCanvas";

type Props = {};

let timeoutHandler: number | null = null;

export type GridCell = {
  x: number;
  y: number;
  alive: boolean;
};

function calculateLiveNeighbors(gridCells: GridCell[][], x: number, y: number) {
  let liveNeighbors = 0;
  const dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
  ];
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    let y1 = y + dir[0];
    let x1 = x + dir[1];

    if (
      x1 >= 0 &&
      y1 >= 0 &&
      x1 < gridCells.length &&
      y1 < gridCells.length &&
      gridCells[y1][x1].alive
    ) {
      liveNeighbors++;
    }
  }

  return liveNeighbors;
}

function generateEmptyGrid(gridSize: number) {
  const newGrid: GridCell[][] = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      newGrid[i][j] = {
        x: i,
        y: j,
        alive: false,
      };
    }
  }
  return newGrid;
}

function generateInitialGrid(gridSize: number) {
  const newGrid: GridCell[][] = generateEmptyGrid(gridSize);
  for (let y = 0; y < newGrid.length; y++) {
    for (let x = 0; x < newGrid[y].length; x++) {
      if (Math.random() < 0.5) {
        newGrid[y][x].alive = Math.random() < 0.5;
      }
    }
  }
  return newGrid;
}

function Game({}: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationDelay, setSimulationDelay] = useState(100);
  const [gridCells, setGridCells] = useState<GridCell[][]>(
    generateInitialGrid(20)
  );

  const runSimulation = () => {
    if (!isRunning) {
      return;
    }

    const newGrid = generateEmptyGrid(gridCells.length);
    for (let y = 0; y < gridCells.length; y++) {
      for (let x = 0; x < gridCells[y].length; x++) {
        const cell = gridCells[y][x];
        const liveNeighbors = calculateLiveNeighbors(gridCells, x, y);

        if (cell.alive && (liveNeighbors === 2 || liveNeighbors === 3)) {
          newGrid[y][x].alive = true;
        } else if (!cell.alive && liveNeighbors === 3) {
          newGrid[y][x].alive = true;
        }
      }
    }
    setGridCells(newGrid);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(runSimulation, simulationDelay);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className='w-full h-screen'>
      <Canvas gridCells={gridCells} />
      <button
        onClick={() => {
          setIsRunning(!isRunning);
        }}
      >
        TOGGLE
      </button>
    </div>
  );
}

export default Game;
