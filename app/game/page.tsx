'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import Game from '@/components/Game';
import HUD from '@/components/HUD';
import { CardInfo } from '@/components/CardInfo';
import { UpgradeShop } from '@/components/UpgradeShop';
import { getErrorMessage } from '@/lib/api/client';
import { buyUpgrade, skipUpgrade, submitProgram } from '@/lib/api/lobby';
import { activePlayedRegister } from '@/lib/playedRegisters';
import {
  cardFromInstruction,
  emptyRegisters,
  handCardsFromMat,
  instructionFromCard,
  REGISTER_COUNT,
  repeatsPreviousRegister,
} from '@/lib/programCards';
import { usePlayerState } from '@/lib/socket/usePlayerState';
import { buttonClassName } from '@/lib/styles';

import type { Board } from '@/types/board';
import type { GameState } from '@/types/gameState';
import type { Player } from '@/types/player';
import type { UpgradeType } from '@/types/playerGameState';
import type { Register } from '@/types/register';
import type { RobotModel } from '@/types/robot';
import type { PlayerColor } from '@/types/lobby';

/**
 * Page for the froentend of the gameboard
 *
 * @author Caroline, Katarina, Kerem, Elias
 */

function robotModelFromColor(color: PlayerColor | undefined): RobotModel {
  return color ? (`${color.toLowerCase()}Robot` as RobotModel) : 'orangeRobot';
}

/* This function is used to get the registers from the board for the current player.
 * It is used to display the registers on the gameboard. */
function registersFromPlayed(board: Board | null, username: string): Register[] {
  return Array.from({ length: REGISTER_COUNT }, (_, index) => {
    const played = board?.registers
      ?.find((register) => register.register === index)
      ?.cards.find((card) => card.username === username);

    /* Return the register number, if the register is revealed and the card in the register */
    return {
      registerNumber: (index + 1) as 1 | 2 | 3 | 4 | 5,
      registerRevealed: true,
      registerCard: played
        ? cardFromInstruction(played.card.instruction, `${username}-${index}`)
        : null,
    };
  });
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      {/* Main gameboard component */}
      <GameView />
    </Suspense>
  );
}

function GameView() {
  const router = useRouter();
  const { username } = useAuth();

  // Board animation display state
  const [completedBoard, setCompletedBoard] = useState<Board | null>(null);
  const [animatingBoard, setAnimatingBoard] = useState<Board | null>(null);
  const [heldLiveBoard, setHeldLiveBoard] = useState<Board | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const boardAtWait = useRef<Board | null>(null);

  // Turn action status flags
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenPhase, setSeenPhase] = useState<string | undefined>(undefined);

  // Hand and register selection
  const [registers, setRegisters] = useState<Register[]>(emptyRegisters);
  const [handOpen, setHandOpen] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [appliedHandKey, setAppliedHandKey] = useState<string | null>(null);

  const handleStepIndexChange = useCallback((index: number | null) => {
    setStepIndex(index);
  }, []);

  const handleAnimationComplete = useCallback((animatedBoard: Board) => {
    setCompletedBoard(animatedBoard);
    setAnimatingBoard((current) => (current === animatedBoard ? null : current));
    setStepIndex(null);
  }, []);

  // page renders before the browser URL is updated.
  const lobbyId = useSearchParams().get('lobby');
  const playerState = usePlayerState(lobbyId, username);

  const liveBoard = playerState?.board ?? null;
  const board = animatingBoard ?? liveBoard;

  // If the user is waiting, set the registers to empty,
  // the card to null,
  // the hand to closed,
  // the waiting flag to false and the error to null.
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
    setSelectedCardId(null);
    setHandOpen(false);
    setIsWaiting(false);
    setError(null);
  }, [board, isWaiting]);

  // Get player state
  const finished = playerState?.status === 'FINISHED';
  const phase = playerState?.round.phase;
  const isProgramming = phase === 'PROGRAMMING';
  const isUpgrade = phase === 'UPGRADE';

  // Get the programming hand key
  const programmingHandKey =
    playerState?.type === 'PROGRAMMING_STARTED'
      ? JSON.stringify(playerState.playerMat?.hand ?? [])
      : null;

  // Did the game finish?
  const showWinner = finished && completedBoard === board;

  // If the live board is not the same as the held live board,
  // set the held live board to the live board and if the live board has steps,
  // set the animating board to the live board.
  //
  // In other words, if the board changed, update it by animations.
  if (liveBoard !== heldLiveBoard) {
    setHeldLiveBoard(liveBoard);
    if ((liveBoard?.steps?.length ?? 0) > 0) {
      setAnimatingBoard(liveBoard);
    }
  }

  // No programming hand key, reset it
  if (programmingHandKey != null && programmingHandKey !== appliedHandKey) {
    setAppliedHandKey(programmingHandKey);
    setRegisters(emptyRegisters());
    setSelectedCardId(null);
    setHandOpen(false);
    setIsWaiting(false);
    setError(null);
  }

  if (phase !== seenPhase) {
    setSeenPhase(phase);
    if (phase === 'UPGRADE') {
      setHandOpen(false);
      setSelectedCardId(null);
    }
  }

  // Get the you player (yourself)
  // Local player snapshot
  const you = playerState?.players.find((player) => player.username === username);
  const youSubmitted = you?.programSubmitted ?? false;
  const energy = you?.energy ?? 0;

  // Hand and register cards
  const handCards = handCardsFromMat(playerState?.playerMat?.hand);
  const availableHand = handCards.filter(
    (card) => !registers.some((register) => register.registerCard?.cardId === card.cardId),
  );
  const selectedCard = availableHand.find((card) => card.cardId === selectedCardId) ?? null;
  const firstInstruction = registers[0]?.registerCard
    ? instructionFromCard(registers[0].registerCard)
    : null;
  const repeatInRegisterOne = firstInstruction != null && repeatsPreviousRegister(firstInstruction);
  const filledCount = registers.filter((register) => register.registerCard !== null).length;

  // Programming phase gates
  const hasPlayedCards = (board?.registers?.length ?? 0) > 0;
  const showingActivation = (animatingBoard?.steps?.length ?? 0) > 0 && stepIndex !== null;
  const canProgram = isProgramming && !youSubmitted && !showingActivation && !hasPlayedCards;
  const locked = isSubmitting || isWaiting || !playerState || finished || !canProgram;
  const canRun = filledCount === REGISTER_COUNT && !locked && !repeatInRegisterOne;
  const waiting = isWaiting || (youSubmitted && isProgramming && !finished);
  const activeRegisterIndex = activePlayedRegister(board?.registers, stepIndex);

  // If the username is not set, return null as the user is not logged in.
  // The user will be redirected to the login page from the logic above.
  if (!username) {
    return null;
  }

  // Swap registers
  const swapRegisters = (indexA: number, indexB: number) => {
    if (locked) return;

    if (indexA === 0 || indexB === 0) {
      const incoming =
        indexA === 0 ? registers[indexB].registerCard : registers[indexA].registerCard;
      const instruction = incoming ? instructionFromCard(incoming) : null;
      if (instruction && repeatsPreviousRegister(instruction)) {
        setError('AGAIN cannot be placed in register 1');
        return;
      }
    }

    setRegisters((current) => {
      const next = [...current];
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

  // Place a card in a register
  const placeCard = (index: number) => {
    if (locked) return;
    if (selectedCard == null) return;

    const instruction = instructionFromCard(selectedCard);
    if (index === 0 && instruction && repeatsPreviousRegister(instruction)) {
      setError('AGAIN cannot be placed in register 1');
      return;
    }

    const next = registers.map((register, i) =>
      i === index ? { ...register, registerCard: selectedCard } : register,
    );
    setRegisters(next);
    setSelectedCardId(null);
    setError(null);

    if (next.every((register) => register.registerCard !== null)) {
      setHandOpen(false);
    }
  };

  // Run the program
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
      const instructions = registers
        .map((register) => instructionFromCard(register.registerCard!))
        .filter((instruction): instruction is string => instruction !== null);

      if (instructions.length !== REGISTER_COUNT) {
        setError('One or more cards are not supported by the backend yet.');
        return;
      }
      if (repeatsPreviousRegister(instructions[0])) {
        setError('AGAIN cannot be placed in register 1');
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
      setRegisters(emptyRegisters());
      setSelectedCardId(null);
      setIsWaiting(false);
    } catch (runError) {
      setError(getErrorMessage(runError, 'Could not run the program.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Buy an upgrade
  async function handleBuy(upgrade: UpgradeType) {
    if (!lobbyId || !username) {
      return;
    }
    setIsUpgrading(true);
    setError(null);
    try {
      await buyUpgrade(lobbyId, { username, upgrade });
    } catch (buyError) {
      setError(getErrorMessage(buyError, 'Could not buy that upgrade.'));
    } finally {
      setIsUpgrading(false);
    }
  }

  // Skip an upgrade
  async function handleSkip() {
    if (!lobbyId || !username) {
      return;
    }
    setIsUpgrading(true);
    setError(null);
    try {
      await skipUpgrade(lobbyId, { username });
    } catch (skipError) {
      setError(getErrorMessage(skipError, 'Could not skip the upgrade.'));
    } finally {
      setIsUpgrading(false);
    }
  }

  // Get the user's board robot
  const userBoardRobot = board?.robots?.find((r) => r.username === username);

  // Get the robot model from the color
  const robotModel = robotModelFromColor(userBoardRobot?.color);

  // Get the shown registers
  const shownRegisters = hasPlayedCards ? registersFromPlayed(board, username) : registers;

  // Get the player
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
      checkpointsCollected: you?.checkpointsReached ?? 0,
      energycubesCollected: energy,
      outOfGame: false,
      damageCount: 0,
    },
    register: shownRegisters,
    priorityOrder: false,
    programSubmitted: youSubmitted,
  };

  // Get the other players
  const otherPlayers: Player[] = (playerState?.players ?? [])
    .filter((gamePlayer) => gamePlayer.username !== username)
    .map((gamePlayer) => {
      const boardRobot = board?.robots?.find((robot) => robot.username === gamePlayer.username);
      return {
        username: gamePlayer.username,
        robot: {
          robotModel: robotModelFromColor(boardRobot?.color),
          position: {
            row: boardRobot?.y ?? 0,
            column: boardRobot?.x ?? 0,
            direction:
              (boardRobot?.orientation.toLowerCase() as 'north' | 'south' | 'east' | 'west') ??
              'north',
          },
          checkpointsCollected: gamePlayer.checkpointsReached,
          energycubesCollected: gamePlayer.energy,
          outOfGame: false,
          damageCount: 0,
        },
        register: registersFromPlayed(board, gamePlayer.username),
        priorityOrder: false,
        programSubmitted: gamePlayer.programSubmitted,
      };
    });

  const status: GameState['status'] = finished
    ? { state: 'over', winner: player }
    : { state: 'inprogress' };
  const hudPlayers = [player, ...otherPlayers];
  const displayState: GameState =
    showingActivation || phase === 'ACTIVATION'
      ? {
          round: 0,
          timerOut: false,
          status,
          players: hudPlayers,
          phase: 'activation_phase',
          activeRegister: ((activeRegisterIndex ?? 0) + 1) as 1 | 2 | 3 | 4 | 5,
        }
      : {
          round: 0,
          timerOut: false,
          status,
          players: hudPlayers,
          phase: phase === 'UPGRADE' ? 'upgrade_phase' : 'programming_phase',
        };

  return (
    <main className="mx-auto flex h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      {showWinner && (
        <p role="status" className="mb-4 text-xl font-bold">
          {playerState?.winnerUsername
            ? `${playerState.winnerUsername} wins!`
            : 'The game has finished.'}
        </p>
      )}

      <HUD
        canRun={canRun}
        discardCount={playerState?.playerMat?.discardPile.length ?? 0}
        drawPileSize={playerState?.playerMat?.drawPileSize ?? 0}
        error={error}
        extraPanel={
          isUpgrade && !showingActivation ? (
            <UpgradeShop
              currentBuyer={playerState?.currentBuyer ?? null}
              disabled={isUpgrading || finished}
              energy={energy}
              onBuy={(upgrade) => void handleBuy(upgrade)}
              onSkip={() => void handleSkip()}
              shop={playerState?.upgradeShop ?? []}
              username={username}
            />
          ) : null
        }
        gameState={displayState}
        locked={locked}
        onHandOpen={() => setHandOpen(true)}
        onPlaceCard={placeCard}
        onRun={() => void handleRun()}
        onSwapRegisters={swapRegisters}
        placingCard={handOpen}
        player={player}
        activeRegisterIndex={activeRegisterIndex}
        waiting={waiting}
      >
        <Game
          board={board}
          onAnimationComplete={handleAnimationComplete}
          onStepIndexChange={handleStepIndexChange}
        />
      </HUD>

      {handOpen && (
        <>
          <div className="fixed inset-0 z-40" />

          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-steel-dark bg-black/85 p-6 shadow-2xl">
            <div className="mb-3 text-xs font-semibold text-bone/70">
              Draw {playerState?.playerMat?.drawPileSize ?? 0} · Discard{' '}
              {playerState?.playerMat?.discardPile.length ?? 0}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {availableHand.map((card) => (
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
