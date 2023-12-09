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

  const onCellClicked = (x: number, y: number) => {
    //create copy of gridCells
    const newGrid = [...gridCells];
    newGrid[y][x].alive = !newGrid[y][x].alive;
    setGridCells(newGrid);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const clearGrid = () => {
    setGridCells(generateEmptyGrid(gridCells.length));
    setIsRunning(false);
  };

  const randomGrid = () => {
    setGridCells(generateInitialGrid(gridCells.length));
    setIsRunning(false);
  };

  const startStopStyle = `${isRunning ? "bg-red-500" : "bg-green-500"} ${
    isRunning ? "hover:bg-red-400" : "hover:bg-green-400"
  } ${isRunning ? "border-red-700" : "border-green-700"} ${
    isRunning ? "hover:border-red-500" : "hover:border-green-500"
  }`;
  return (
    <div className='w-full h-screen'>
      <Canvas gridCells={gridCells} onCellClicked={onCellClicked} />
      <div className='flex flex-row space-x-8 w-full p-4'>
        <button
          onClick={toggleSimulation}
          className={`text-white font-bold py-2 px-4 border-b-4 rounded ${startStopStyle}`}
        >
          Start/Stop
        </button>
        <button
          onClick={clearGrid}
          className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
        >
          Clear Grid
        </button>
        <button
          onClick={randomGrid}
          className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
        >
          Random Grid
        </button>
      </div>
    </div>
  );
}

export default Game;
