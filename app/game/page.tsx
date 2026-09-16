"use client";

import { useRouter } from "next/navigation";
import { buttonClassName } from "@/lib/styles";
import { getUsername } from "@/lib/username";
import { useEffect, useState } from "react";
import Image from "next/image";

const boardSize = 12; // Boardsize 12x12

export default function GamePage() {
  const router = useRouter();
  const [username] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getUsername(),
  );

  // State to track robot position: x (col) and y (row with negative pointing UP)
  const [robotPos, setRobotPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0, // Starts at bottom-left corner
  });

  useEffect(() => {
    if (!username) {
      router.replace("/login");
    }
  }, [router, username]);

  if (!username) {
    return null;
  }

  const handleTileClick = (x: number, y: number) => {
    setRobotPos({ x, y });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center p-6 text-center">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>
      <p className="absolute right-6 top-6">Logged in as: {username}</p>
      <button
        className={buttonClassName}
        onClick={() => router.push("/main-menu")}
        type="button"
      >
        Back to Main Menu
      </button>

      {/* Gameboard Grid */}
      <section className="mt-6 border-2 border-slate-700 bg-slate-900 p-2 rounded-lg shadow-xl">
        <div
          className="grid bg-slate-800 p-1"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const gridRow = Math.floor(index / boardSize);
            const x = index % boardSize;
            const y = -(boardSize - 1 - gridRow); // Negative Y points UP

            const hasRobot = robotPos.x === x && robotPos.y === y;

            return (
              <Tile
                key={index}
                x={x}
                y={y}
                hasRobot={hasRobot}
                onClick={() => handleTileClick(x, y)}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}

interface TileProps {
  x: number;
  y: number;
  hasRobot: boolean;
  onClick: () => void;
}

function Tile({ x, y, hasRobot, onClick }: TileProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="relative h-10 w-10 sm:h-12 sm:w-12 border border-slate-700 bg-slate-950 hover:bg-pink-800 transition-colors flex items-center justify-center text-xs font-mono text-slate-400"
    >
      {hasRobot && (
        <div className="relative z-10 w-4/5 h-4/5 flex items-center justify-center">
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