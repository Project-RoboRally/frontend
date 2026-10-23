'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Game from '@/components/Game';
import HUD from '@/components/HUD';
import { CardInfo } from '@/components/CardInfo';
import { getErrorMessage } from '@/lib/api/client';
import { submitProgram } from '@/lib/api/lobby';
import { MockCards } from '@/lib/mock-cards';
import { mockRegister } from '@/lib/mock-register';
import { PROGRAM_CARDS, REGISTER_COUNT } from '@/lib/programCards';
import { useLobbyBoard } from '@/lib/socket/useLobbyBoard';
import { buttonClassName } from '@/lib/styles';
import { getUsername } from '@/lib/username';

import type { Board } from '@/types/board';
import type { ProgrammingCard } from '@/types/cards';
import type { GameState } from '@/types/gameState';
import type { Player } from '@/types/player';
import type { Register } from '@/types/register';
import type { RobotModel } from '@/types/robot';

/**
 * Page for the froentend of the gameboard
 *
 * @author Caroline, Katarina, Kerem
 */

// turns a card object into the text instruction the backend expects. Returns null if the backend doesn't know the card (Only knows PROGRAM_CARDS)
function cardToInstruction(card: ProgrammingCard): string | null {
  let instruction: string | null = null;

  if (card.cardType === 'move') {
    instruction = `MOVE_${card.cardStrength}`;
  } else if (card.cardType === 'rotate') {
    instruction = card.cardDirection === 'left' ? 'LEFT_TURN' : 'RIGHT_TURN';
  }

  return PROGRAM_CARDS.some((c) => c.instruction === instruction) ? instruction : null;
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GameView />
    </Suspense>
  );
}

function GameView() {
  const router = useRouter();

  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );
  // page renders before the browser URL is updated.
  const lobbyId = useSearchParams().get('lobby');
  const board = useLobbyBoard(lobbyId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boardAtWait = useRef<Board | null>(null);

  // Registrene ligger i state, så de kan ændres (bytte rundt) senere
  const [registers, setRegisters] = useState<Register[]>(mockRegister);
  const [handOpen, setHandOpen] = useState<boolean>(false); // Open or close the hand
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      router.replace('/login');
    }
  }, [router, username]);

  useEffect(() => {
    if (!isWaiting) {
      return;
    }
    if (board === boardAtWait.current) {
      return;
    }
    if (boardAtWait.current == null) {
      boardAtWait.current = board;
      return;
    }
    setRegisters(mockRegister);
    setSelectedCardId(null);
    setHandOpen(false); // NEW CODE
    setIsWaiting(false);
    setError(null);
  }, [board, isWaiting]);

  if (!username) {
    return null;
  }

  // counts the registers that have a card
  const filledCount = registers.filter((register) => register.registerCard !== null).length;
  const locked = isSubmitting || isWaiting;
  const canRun = filledCount === REGISTER_COUNT && !locked;

  const swapRegisters = (indexA: number, indexB: number) => {
    if (locked) return;

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
    });
  };

  const placeCard = (index: number) => {
    if (locked) return;
    if (selectedCardId === null) return; // NO card choosen

    // Copying the hand-index card over to the register-index (also deleting itself hand-index)
    const card = MockCards[selectedCardId];
    const next = registers.map((register, i) =>
      i === index ? { ...register, registerCard: card } : register,
    );
    setRegisters(next);
    setSelectedCardId(null);
    setError(null);

    // Closing the hand, when all 5 registers has a card
    if (next.every((register) => register.registerCard !== null)) {
      setHandOpen(false);
    }
  };

  async function handleRun() {
    if (!canRun || !username) {
      return;
    }
    if (!lobbyId) {
      setError('This game is not in a lobby.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Backend expects text instructions, so each card object is converted
      const instructions = registers
        .map((register) => cardToInstruction(register.registerCard!))
        .filter((instruction): instruction is string => instruction !== null);

      // Stops if a card isn't supported by the backend yet
      if (instructions.length !== REGISTER_COUNT) {
        setError('One or more cards are not supported by the backend yet.');
        return;
      }

      const response = await submitProgram(lobbyId, {
        username,
        registers: instructions,
      });
      if (!response.executed) {
        boardAtWait.current = board;
        setIsWaiting(true);
        return;
      }
      setRegisters(mockRegister);
      setSelectedCardId(null);
      setIsWaiting(false);
    } catch (runError) {
      setError(getErrorMessage(runError, 'Could not run the program.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Find the robot corresponding to the current user on the board
  const userBoardRobot = board?.robots?.find((r) => r.username === username);

  // Generate the RobotModel from the users robot color
  const robotModel: RobotModel = userBoardRobot
    ? (`${userBoardRobot.color.toLowerCase()}Robot` as RobotModel)
    : 'orangeRobot'; // Fallback if not found yet

  // Construct the player object
  const player: Player = {
    username,
    robot: {
      robotModel,
      position: {
        row: userBoardRobot?.y ?? 0,
        column: userBoardRobot?.x ?? 0,
        direction:
          (userBoardRobot?.orientation.toLowerCase() as 'north' | 'south' | 'east' | 'west') ??
          'north',
      },
      checkpointsCollected: 0,
      energycubesCollected: 0,
      outOfGame: false,
      damageCount: 0,
    },
    register: registers,
    priorityOrder: false,
  };

  // TODO: Replace with actual game state from backend.
  const gameState: GameState = {
    round: 1,
    timerOut: false,
    status: { state: 'inprogress' },
    players: [
      player,
      {
        username: 'BotPlayer',
        robot: {
          robotModel: 'blueRobot',
          position: { row: 1, column: 1, direction: 'north' },
          checkpointsCollected: 0,
          energycubesCollected: 0,
          outOfGame: false,
          damageCount: 0,
        },
        register: [],
        priorityOrder: false,
      },
    ],
    phase: 'programming_phase',
  };

  return (
    <main className="mx-auto flex h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      <HUD
        canRun={canRun}
        error={error}
        gameState={gameState}
        locked={locked}
        onHandOpen={() => setHandOpen(true)}
        onPlaceCard={placeCard}
        onRun={() => void handleRun()}
        onSwapRegisters={swapRegisters}
        placingCard={handOpen}
        player={player}
        waiting={isWaiting}
      >
        <Game board={board} />
      </HUD>

      {/* When the hand is shown */}
      {handOpen && (
        <>
          {/* Invisible overlay, so you can't click on other stuff, other than the hand and register */}
          <div className="fixed inset-0 z-40" />

          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-steel-dark bg-black/85 p-6 shadow-2xl">
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(MockCards)
                // Deletes the cards which is already in the register, so they can't be used twice
                .filter(
                  (card) =>
                    !registers.some((register) => register.registerCard?.cardId === card.cardId),
                )

                // Creating one button for each card there is left
                .map((card) => (
                  <button
                    key={card.cardId}
                    type="button"
                    onClick={() =>
                      setSelectedCardId(selectedCardId === card.cardId ? null : card.cardId)
                    }
                    className={`flex h-24 w-16 items-center justify-center rounded-md border-2 text-sm font-bold text-bone transition ${
                      selectedCardId === card.cardId
                        ? 'border-verdigris bg-verdigris-dark/40 ring-2 ring-verdigris'
                        : 'border-steel-dark bg-charcoal hover:border-cobber-light'
                    }`}
                  >
                    <CardInfo card={card} />
                  </button>
                ))}
            </div>
          </div>
        </>
      )}

      <button
        className={`${buttonClassName} mt-6`}
        onClick={() => router.push('/main-menu')}
        type="button"
      >
        Back to Main Menu
      </button>
    </main>
  );
}
