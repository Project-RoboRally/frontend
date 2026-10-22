"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Game from "@/components/Game";
import HUD from "@/components/HUD";
import { CardInfo } from "@/components/CardInfo";
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
 * @author Caroline, Katarina, Kerem
 */

export default function GamePage() {
  const router = useRouter();

  const [username] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getUsername(),
  );
  
  // Registrene ligger i state, så de kan ændres (bytte rundt) senere
  const [registers, setRegisters] = useState<Register[]>(mockRegister);
  const [handOpen, setHandOpen] = useState<boolean>(false); // Open or close the hand
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

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

  const placeCard = (index: number) => {
    if(selectedCardId === null) return; // NO card choosen

    // Copying the hand-index card over to the register-index (also deleting itself hand-index)
    const card = MockCards[selectedCardId];
    const next = registers.map((register, i) => i === index ? {...register, registerCard: card} : register);
    setRegisters(next);
    setSelectedCardId(null);

    // Closing the hand, when all 5 registers has a card
    if(next.every((register) => register.registerCard !== null)) {
      setHandOpen(false);
    }
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

      <HUD 
        gameState={gameState} 
        player={player} 
        onSwapRegisters={swapRegisters} 
        onHandOpen={() => setHandOpen(true)}
        placingCard={handOpen}
        onPlaceCard={placeCard}
      >
        <Game />
      </HUD>
      
      {/* When the hand is shown */}
      {handOpen && ( 
        <>
          {/* Invisible overlay, so you can't click on other stuff, other than the hand and register */}
          <div className="fixed inset-0 z-40"/>

          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-steel-dark bg-black/85 p-6 shadow-2xl">
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(MockCards)
                // Deletes the cards which is already in the register, so they can't be used twice
                .filter((card) =>
                  !registers.some((register) => register.registerCard?.cardId === card.cardId))
                
                // Creating one button for each card there is left
                .map((card) => (
                  <button 
                  key={card.cardId}
                  type="button" 
                  onClick={() => setSelectedCardId(selectedCardId === card.cardId ? null : card.cardId)}
                  className={`flex h-24 w-16 items-center justify-center rounded-md border-2 text-sm font-bold text-bone transition ${
                      selectedCardId === card.cardId ? "border-verdigris bg-verdigris-dark/40 ring-2 ring-verdigris" : "border-steel-dark bg-charcoal hover:border-cobber-light"
                          }`}
                > 
                  <CardInfo card={card}/>
                </button>
                ))}
            </div>
          </div>
        </>
      )}

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
