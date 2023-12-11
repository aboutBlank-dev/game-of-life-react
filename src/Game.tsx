import { useEffect, useReducer, useState } from "react";
import Canvas, { GridCell } from "./components/GridCanvas";

type Props = {};

interface GameCell extends GridCell {
  alive: boolean;
}

function Game({}: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationDelay, setSimulationDelay] = useState(100);
  const [cellSize, setCellSize] = useState(30);
  const [gridIndexes, setGridIndexes] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  const [liveCells, setLiveCells] = useState<Map<string, GameCell>>(
    generateRandomGrid(
      gridIndexes.startX,
      gridIndexes.startY,
      gridIndexes.endX,
      gridIndexes.endY
    )
  );

  //Run simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(runSimulation, simulationDelay);
    return () => {
      clearInterval(interval);
    };
  });

  const onCellClicked = (x: number, y: number) => {
    const newCells = new Map(liveCells);
    const cell = newCells.get([x, y].join("-"));
    if (!cell) {
      newCells.set([x, y].join("-"), { x, y, alive: true });
    } else {
      cell.alive = !cell.alive;
    }

    setLiveCells(newCells);

    console.log("clicked cell", x, y);
  };

  const onGridIndexesChanged = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    setGridIndexes({ startX, startY, endX, endY });
  };

  const setCellStyle = (gridCell: GridCell, ctx: CanvasRenderingContext2D) => {
    const gameCell = liveCells.get([gridCell.x, gridCell.y].join("-"));

    if (!gameCell) {
      ctx.fillStyle = "white";
      return;
    }

    ctx.fillStyle = gameCell.alive ? "black" : "white";
  };

  const runSimulation = () => {
    if (!isRunning) {
      return;
    }

    const newCells = new Map<string, GameCell>();
    const cellsThatNeedToBeChecked = new Set<GameCell>();

    for (const cell of liveCells.values()) {
      cellsThatNeedToBeChecked.add(cell);
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
        let x1 = cell.x + dir[0];
        let y1 = cell.y + dir[1];

        cellsThatNeedToBeChecked.add({ x: x1, y: y1, alive: false });
      }
    }

    for (const cell of cellsThatNeedToBeChecked) {
      const liveNeighbors = calculateLiveNeighbors(liveCells, cell.x, cell.y);
      const isAlive = liveCells.get([cell.x, cell.y].join("-"))?.alive || false;

      if (isAlive) {
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          newCells.set([cell.x, cell.y].join("-"), { ...cell, alive: true });
        }
      } else {
        if (liveNeighbors === 3) {
          newCells.set([cell.x, cell.y].join("-"), { ...cell, alive: true });
        }
      }
    }

    setLiveCells(newCells);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const clearGrid = () => {
    setLiveCells(new Map<string, GameCell>());
    setIsRunning(false);
  };

  const randomGrid = () => {
    setLiveCells(
      generateRandomGrid(
        gridIndexes.startX,
        gridIndexes.startY,
        gridIndexes.endX,
        gridIndexes.endY
      )
    );
    setIsRunning(false);
  };

  const startStopStyle = `${isRunning ? "bg-red-500" : "bg-green-500"} ${
    isRunning ? "hover:bg-red-400" : "hover:bg-green-400"
  } ${isRunning ? "border-red-700" : "border-green-700"} ${
    isRunning ? "hover:border-red-500" : "hover:border-green-500"
  }`;

  console.log("game render");
  return (
    // make a div that takes up the full height of the screen
    <div className='flex flex-col h-screen'>
      <div className='grow'>
        <Canvas
          cellSize={cellSize}
          onCellClicked={onCellClicked}
          onVisibleGridIndexesChanged={onGridIndexesChanged}
          setCellStyle={setCellStyle}
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
          min='50'
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
          min='25'
          max='100'
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          step='1'
          className='rotate-180 w-16 h-2 my-auto bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
        />
      </div>
    </div>
  );
}

export default Game;

function calculateLiveNeighbors(
  liveCells: Map<string, GameCell>,
  x: number,
  y: number
) {
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
    let x1 = x + dir[0];
    let y1 = y + dir[1];

    const cell = liveCells.get([x1, y1].join("-"));
    if (!cell) continue;

    if (cell.alive) {
      liveNeighbors++;
    }
  }

  return liveNeighbors;
}

function generateRandomGrid(
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const newCells: Map<string, GameCell> = new Map();
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (Math.random() < 0.5) {
        newCells.set([x, y].join("-"), { x, y, alive: true });
      }
    }
  }
  return newCells;
}
