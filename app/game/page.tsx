'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Game from '@/components/Game';
import HUD from '@/components/HUD';
import { getErrorMessage } from '@/lib/api/client';
import { submitProgram } from '@/lib/api/lobby';
import { emptyRegisters, REGISTER_COUNT } from '@/lib/programCards';
import { useLobbyBoard } from '@/lib/socket/useLobbyBoard';
import { buttonClassName } from '@/lib/styles';
import { getUsername } from '@/lib/username';

import type { Board } from '@/types/board';
import type { GameState } from '@/types/gameState';
import type { Player } from '@/types/player';

/**
 * Page for the froentend of the gameboard
 *
 * @author Caroline, Katarina
 */

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
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(null);
  const [registers, setRegisters] = useState<(string | null)[]>(emptyRegisters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boardAtWait = useRef<Board | null>(null);

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
    setRegisters(emptyRegisters());
    setSelectedInstruction(null);
    setIsWaiting(false);
    setError(null);
  }, [board, isWaiting]);

  if (!username) {
    return null;
  }

  const filled = registers.filter((slot): slot is string => slot != null);
  const locked = isSubmitting || isWaiting;
  const canRun = filled.length === REGISTER_COUNT && !locked;

  function handleSelectCard(instruction: string) {
    if (locked) {
      return;
    }
    setError(null);
    setSelectedInstruction((current) => (current === instruction ? null : instruction));
  }

  function handleRegisterClick(index: number) {
    if (locked) {
      return;
    }
    setError(null);
    setRegisters((current) => {
      const next = emptyRegisters();
      for (let slot = 0; slot < REGISTER_COUNT; slot += 1) {
        next[slot] = current[slot] ?? null;
      }
      if (selectedInstruction) {
        next[index] = selectedInstruction;
        return next;
      }
      if (next[index]) {
        next[index] = null;
        return next;
      }
      return current;
    });
  }

  async function handleRun() {
    if (filled.length !== REGISTER_COUNT || locked || !username) {
      return;
    }
    if (!lobbyId) {
      setError('This game is not in a lobby.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await submitProgram(lobbyId, {
        username,
        registers: filled,
      });
      if (!response.executed) {
        boardAtWait.current = board;
        setIsWaiting(true);
        return;
      }
      setRegisters(emptyRegisters());
      setSelectedInstruction(null);
      setIsWaiting(false);
    } catch (runError) {
      setError(getErrorMessage(runError, 'Could not run the program.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // TODO: Replace with actual player data from backend/game state.
  const player: Player = {
    username,
    robot: {
      robotModel: 'orangeRobot',
      position: {
        row: 0,
        column: 0,
        direction: 'north',
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
      state: 'inprogress',
    },
    players: [player],
    phase: 'programming_phase',
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      <HUD
        canRun={canRun}
        error={error}
        gameState={gameState}
        locked={locked}
        onRegisterClick={handleRegisterClick}
        onRun={() => void handleRun()}
        onSelectCard={handleSelectCard}
        player={player}
        registers={registers}
        selectedInstruction={selectedInstruction}
        waiting={isWaiting}
      >
        <Game board={board} />
      </HUD>

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
