import { useState } from "react";
import Canvas from "./components/GridCanvas";

type Props = {};

export type GridCell = {
  x: number;
  y: number;
  alive: boolean;
};

function generateInitialGrid(gridSize: number) {
  const newGrid: GridCell[][] = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      newGrid[i][j] = {
        x: i,
        y: j,
        alive: Math.random() > 0.9,
      };
    }
  }
  return newGrid;
}

function Game({}: Props) {
  const [gridCells, setGridCells] = useState<GridCell[][]>(
    generateInitialGrid(20)
  );

  return (
    <div className='w-full h-screen'>
      <Canvas gridCells={gridCells} />
    </div>
  );
}

export default Game;
