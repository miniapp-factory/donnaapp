"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function getRandomTileValue() {
  return Math.random() < TILE_PROBABILITIES[0] ? TILE_VALUES[0] : TILE_VALUES[1];
}

function cloneGrid(grid: number[][]) {
  return grid.map(row => [...row]);
}

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Add a random tile to the grid
  const addRandomTile = (g: number[][]) => {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return g;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    g[r][c] = getRandomTileValue();
    return g;
  };

  // Initialize with two tiles
  useEffect(() => {
    let g = cloneGrid(grid);
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
  }, []);

  const compress = (row: number[]) => {
    const newRow = row.filter(v => v !== 0);
    while (newRow.length < GRID_SIZE) newRow.push(0);
    return newRow;
  };

  const merge = (row: number[]) => {
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        row[i + 1] = 0;
        setScore(prev => prev + row[i]);
        if (row[i] === 2048) setGameWon(true);
      }
    }
    return row;
  };

  const moveRowLeft = (row: number[]) => {
    const compressed = compress(row);
    const merged = merge(compressed);
    return compress(merged);
  };

  const move = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    let newGrid = cloneGrid(grid);
    let moved = false;

    const rotate = (g: number[][], times: number) => {
      let res = g;
      for (let t = 0; t < times; t++) {
        const tmp: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            tmp[c][GRID_SIZE - 1 - r] = res[r][c];
          }
        }
        res = tmp;
      }
      return res;
    };

    // Normalize to left move
    if (direction === "up") newGrid = rotate(newGrid, 1);
    else if (direction === "right") newGrid = rotate(newGrid, 2);
    else if (direction === "down") newGrid = rotate(newGrid, 3);

    for (let r = 0; r < GRID_SIZE; r++) {
      const original = newGrid[r];
      const movedRow = moveRowLeft(original);
      if (!moved && JSON.stringify(original) !== JSON.stringify(movedRow)) moved = true;
      newGrid[r] = movedRow;
    }

    // Rotate back
    if (direction === "up") newGrid = rotate(newGrid, 3);
    else if (direction === "right") newGrid = rotate(newGrid, 2);
    else if (direction === "down") newGrid = rotate(newGrid, 1);

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      if (!hasMoves(newGrid)) setGameOver(true);
    }
  };

  const hasMoves = (g: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c < GRID_SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
        if (r < GRID_SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  };

  const restart = () => {
    setGrid(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    let g = cloneGrid(grid);
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-md">
        <span className="text-xl font-semibold">2048</span>
        <span className="text-xl font-semibold">Score: {score}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-12 rounded-md text-2xl font-bold ${
              val === 0
                ? "bg-gray-200"
                : val <= 4
                ? "bg-yellow-200"
                : val <= 8
                ? "bg-yellow-300"
                : val <= 16
                ? "bg-yellow-400"
                : val <= 32
                ? "bg-yellow-500"
                : val <= 64
                ? "bg-yellow-600"
                : val <= 128
                ? "bg-yellow-700"
                : val <= 256
                ? "bg-yellow-800"
                : val <= 512
                ? "bg-yellow-900"
                : "bg-red-500"
            }`}
          >
            {val !== 0 ? val : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")}>↑</Button>
        <Button onClick={() => move("left")}>←</Button>
        <Button onClick={() => move("right")}>→</Button>
        <Button onClick={() => move("down")}>↓</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={restart}>Restart</Button>
        {gameOver && (
          <Share
            text={`I scored ${score} in 2048! ${url}`}
          />
        )}
      </div>
      {gameWon && <span className="text-green-600 font-semibold">You reached 2048!</span>}
    </div>
  );
}
