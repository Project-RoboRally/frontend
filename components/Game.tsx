"use client";

import { useState } from "react";
import Tile from "./Tile";

const BOARD_SIZE = 12;

interface Position {
  x: number;
  y: number;
}

export default function Game() {
  // x = column
  // y = row, where negative values point upward.
  const [robotPos, setRobotPos] = useState<Position>({
    x: 0,
    y: 0,
  });

  const handleTileClick = (x: number, y: number) => {
    setRobotPos({ x, y });
  };

  return (
    <section className="aspect-square w-[600px] rounded-lg border-2 border-slate-700 bg-slate-900 p-2 shadow-xl">
      <div
        className="grid h-full w-full bg-slate-800 p-1"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map(
          (_, index) => {
            const gridRow = Math.floor(index / BOARD_SIZE);
            const x = index % BOARD_SIZE;

            // Bottom row = 0.
            // Rows above it become -1, -2, etc.
            const y = -(BOARD_SIZE - 1 - gridRow);

            const hasRobot =
              robotPos.x === x && robotPos.y === y;

            return (
              <Tile
                key={index}
                x={x}
                y={y}
                hasRobot={hasRobot}
                onClick={() => handleTileClick(x, y)}
              />
            );
          },
        )}
      </div>
    </section>
  );
}