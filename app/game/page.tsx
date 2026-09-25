"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Game from "@/components/Game";
import HUD from "@/components/HUD";
import { buttonClassName } from "@/lib/styles";
import { getUsername } from "@/lib/username";

import type { GameState } from "@/types/gameState";
import type { Player } from "@/types/player";

/**
 * Page for the froentend of the gameboard 
 * 
 * @author Caroline, Katarina
 */

export default function GamePage() {
  const router = useRouter();

  const [username] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getUsername(),
  );

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      <p className="absolute right-6 top-6">
        Logged in as: {username}
      </p>

      <HUD gameState={gameState} player={player}>
        <Game />
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