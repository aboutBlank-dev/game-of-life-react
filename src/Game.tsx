import { useEffect, useState } from "react";
import Canvas, { GridCell } from "./components/GridCanvas";

type Props = {};

function Game({}: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationDelay, setSimulationDelay] = useState(100);
  const [cellSize, setCellSize] = useState(20);
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [gridCells, setGridCells] = useState<GridCell[][]>(
    generateRandomGrid(gridDimensions.width, gridDimensions.height)
  );

  //Run simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(runSimulation, simulationDelay);
    return () => {
      clearInterval(interval);
    };
  });

  //Update grid Cells
  useEffect(() => {
    setGridCells(
      changeGridSize(gridCells, gridDimensions.width, gridDimensions.height)
    );
  }, [gridDimensions]);

  const onCellClicked = (x: number, y: number) => {
    const newGrid = [...gridCells]; //copy grid
    newGrid[y][x].alive = !newGrid[y][x].alive;
    setGridCells(newGrid);
  };

  const onGridSizeChanged = (width: number, height: number) => {
    setGridDimensions({ width, height });
  };

  const runSimulation = () => {
    if (!isRunning) {
      return;
    }

    const newGrid = generateEmptyGrid(
      gridDimensions.width,
      gridDimensions.height
    );
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

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const clearGrid = () => {
    setGridCells(
      generateEmptyGrid(gridDimensions.width, gridDimensions.height)
    );
    setIsRunning(false);
  };

  const randomGrid = () => {
    setGridCells(
      generateRandomGrid(gridDimensions.width, gridDimensions.height)
    );
    setIsRunning(false);
  };

  const startStopStyle = `${isRunning ? "bg-red-500" : "bg-green-500"} ${
    isRunning ? "hover:bg-red-400" : "hover:bg-green-400"
  } ${isRunning ? "border-red-700" : "border-green-700"} ${
    isRunning ? "hover:border-red-500" : "hover:border-green-500"
  }`;

  return (
    // make a div that takes up the full height of the screen
    <div className='flex flex-col h-screen'>
      <div className='grow'>
        <Canvas
          cellSize={cellSize}
          gridCells={gridCells}
          onCellClicked={onCellClicked}
          onGridSizeChanged={onGridSizeChanged}
        />
      </div>
      <div className='flex flex-row space-x-8 w-full p-4 bg-slate-400'>
        <button
          onClick={toggleSimulation}
          className={`select-none text-white font-bold py-2 px-4 border-b-4 rounded ${startStopStyle}`}
        >
          Start/Stop
        </button>
        <button
          onClick={clearGrid}
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
        >
          Clear Grid
        </button>
        <button
          onClick={randomGrid}
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
        >
          Random Grid
        </button>
        <label
          htmlFor='simulation-delay-range'
          className='text-white font-bold py-2 px-4'
        >
          Simulation Speed
        </label>
        <input
          id='simulation-delay-range'
          type='range'
          min='10'
          max='1000'
          value={simulationDelay}
          onChange={(e) => setSimulationDelay(Number(e.target.value))}
          step='1'
          className='rotate-180 w-16 h-2 my-auto bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
        />
        <label
          htmlFor='grid-size-range'
          className='text-white font-bold py-2 px-4'
        >
          Grid Size
        </label>
        <input
          id='grid-size-range'
          type='range'
          min='10'
          max='100'
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          step='1'
          className='w-16 h-2 my-auto bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
        />
      </div>
    </div>
  );
}

export default Game;

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

function generateEmptyGrid(gridWidth: number, gridHeight: number) {
  const newGrid: GridCell[][] = [];
  for (let i = 0; i < gridWidth; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridHeight; j++) {
      newGrid[i][j] = {
        x: i,
        y: j,
        alive: false,
      };
    }
  }
  return newGrid;
}

function generateRandomGrid(gridWidth: number, gridHeight: number) {
  const newGrid: GridCell[][] = generateEmptyGrid(gridWidth, gridHeight);
  for (let y = 0; y < newGrid.length; y++) {
    for (let x = 0; x < newGrid[y].length; x++) {
      if (Math.random() < 0.5) {
        newGrid[y][x].alive = Math.random() < 0.5;
      }
    }
  }
  return newGrid;
}

function changeGridSize(
  originalGrid: GridCell[][],
  gridWidth: number,
  gridHeight: number
): GridCell[][] {
  const newGrid: GridCell[][] = generateEmptyGrid(gridWidth, gridHeight);

  for (let x = 0; x < originalGrid.length; x++) {
    for (let y = 0; y < originalGrid[x].length; y++) {
      if (x < gridWidth && y < gridHeight) {
        newGrid[x][y] = originalGrid[x][y];
      }
    }
  }

  return newGrid;
}
