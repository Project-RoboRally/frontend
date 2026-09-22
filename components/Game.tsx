"use client";

import Image from "next/image";
import { useState } from "react";

const BOARD_SIZE = 12;

interface Position {
  x: number;
  y: number;
}

interface TileProps {
  x: number;
  y: number;
  hasRobot: boolean;
  onClick: () => void;
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

function Tile({ x, y, hasRobot, onClick }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Tile ${x}, ${y}`}
      className="relative flex h-full w-full items-center justify-center border border-slate-700 bg-slate-950 text-xs text-slate-400 transition-colors hover:bg-pink-800"
    >
      {hasRobot && (
        <div className="relative z-10 flex h-4/5 w-4/5 items-center justify-center">
          <Image
            src="/orangeRobot1.png"
            alt="Orange Robot"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      )}
    </button>
  );
}