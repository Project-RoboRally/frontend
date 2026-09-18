"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import HUD from "@/components/HUD";
import { buttonClassName } from "@/lib/styles";
import { getUsername } from "@/lib/username";

import type { GameState } from "@/types/gameState";
import type { Player } from "@/types/player";
import type { Robot } from "@/types/robot";

const BOARD_SIZE = 12;

export default function GamePage() {
  const router = useRouter();

  const [board] = useState(
    Array(BOARD_SIZE * BOARD_SIZE).fill(null),
  );

  const [username] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getUsername(),
  );

  const [robots] = useState<Robot[]>([]);

  useEffect(() => {
    if (!username) {
      router.replace("/login");
    }
  }, [router, username]);

  if (!username) {
    return null;
  }

  // TODO: Replace with actual player data from backend/game state.
  const player: Player = {
    username,
    robot: {
      robotModel: "twonky",
      position: {
        row: 0,
        column: 0,
        direction: "north",
      },
      checkpointsCollected: 0,
      energycubesCollected: 0,
      outOfGame: false,
      damageCount: 0,
    },
    register: [],
    priorityOrder: false,
  };

  // TODO: Replace with actual game state from backend.
  const gameState: GameState = {
    round: 1,
    timerOut: false,
    status: {
      state: "inprogress",
    },
    players: [player],
    phase: "programming_phase",
  };

  const handleTileClick = (index: number) => {
    const row = Math.floor(index / BOARD_SIZE);
    const column = index % BOARD_SIZE;

    console.log("Clicked tile:", row, column);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      <HUD
        gameState={gameState}
        player={player}
      >
        <section className="w-[600px] aspect-square rounded-lg border-2 border-slate-700 bg-slate-900 p-2 shadow-xl">
          <div
            className="grid h-full w-full bg-slate-800 p-1"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {board.map((cell, index) => (
              <Tile
                key={index}
                index={index}
                value={cell}
                onClick={() => handleTileClick(index)}
                robots={robots}
              />
            ))}
          </div>
        </section>
      </HUD>

      <button
        className={`${buttonClassName} mt-6`}
        onClick={() => router.push("/main-menu")}
        type="button"
      >
        Back to Main Menu
      </button>
    </main>
  );
}

function Tile({
                index,
                value,
                onClick,
                robots,
              }: {
  index: number;
  value: unknown;
  onClick: () => void;
  robots: Robot[];
}) {
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;

  const robot = robots.find(
    (robot) =>
      robot.position.row === row &&
      robot.position.column === column,
  );

  return (
    <button
      onClick={onClick}
      className="flex h-full w-full items-center justify-center border border-slate-700 bg-slate-950 text-xs text-slate-400 transition-colors hover:bg-pink-800"
    >
      {robot ? robot.robotModel : ""}
    </button>
  );
}