"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Game from "@/components/Game";
import HUD from "@/components/HUD";
import { buttonClassName } from "@/lib/styles";
import { getUsername } from "@/lib/username";

import type { GameState } from "@/types/gameState";
import type { Player } from "@/types/player";
import type { Register } from "@/types/register";
import { MockCards } from "@/lib/mock-cards";
import { mockRegister } from "@/lib/mock-register";

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
  
  // Registrene ligger i state, så de kan ændres (bytte rundt) senere
  const [registers, setRegisters] = useState<Register[]>(mockRegister);

  const swapRegisters = (indexA: number, indexB: number) => {
    setRegisters((current) => {
      const next = [...current]; // copies the current object to a new one

      // The register number stays the same since they don't move, so the actuall card and the revealed boolean moves together
      next[indexA] = {
        ...current[indexA],
        registerRevealed: current[indexB].registerRevealed,
        registerCard: current[indexB].registerCard,
      };

      next[indexB] = {
        ...current[indexB],
        registerRevealed: current[indexA].registerRevealed,
        registerCard: current[indexA].registerCard,
      };

      return next;
    })
  }

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
    deck: [],
    hand: Object.values(MockCards),
    register: registers,
    discardPile: [],
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
    <main className="mx-auto flex h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      <HUD gameState={gameState} player={player} swapRegisters={swapRegisters}>
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
