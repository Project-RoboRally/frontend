'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Game from '@/components/Game';
import HUD from '@/components/HUD';
import { CardInfo } from '@/components/CardInfo';
import { ChoicePanel } from '@/components/ChoicePanel';
import { KickVotePanel } from '@/components/KickVotePanel';
import { ProgrammingUpgradeBar } from '@/components/upgrades/ProgrammingUpgradeBar';
import { UpgradeShop } from '@/components/UpgradeShop';
import { getErrorMessage } from '@/lib/api/client';
import {
  buyUpgrade,
  makeChoice,
  skipUpgrade,
  startKickVote,
  submitProgram,
  voteOnKick,
} from '@/lib/api/game';
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
import { usePresence } from '@/lib/socket/usePresence';
import { buttonClassName } from '@/lib/styles';
import { getUsername } from '@/lib/username';

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

/* Registers revealed on the shared board during activation. */
function registersFromPlayed(board: Board | null, username: string): Register[] {
  return Array.from({ length: REGISTER_COUNT }, (_, index) => {
    const played = board?.registers
      ?.find((register) => register.register === index)
      ?.cards.find((card) => card.username === username);

    return {
      registerNumber: (index + 1) as 1 | 2 | 3 | 4 | 5,
      registerRevealed: true,
      registerCard: played
        ? cardFromInstruction(played.card.instruction, `${username}-${index}`)
        : null,
    };
  });
}

/* Own mat registers - always available to you once programmed. */
function registersFromMat(
  matRegisters: { index: number; card: { instruction: string } | null }[] | undefined,
): Register[] {
  return Array.from({ length: REGISTER_COUNT }, (_, index) => {
    const mat = matRegisters?.find((register) => register.index === index);
    return {
      registerNumber: (index + 1) as 1 | 2 | 3 | 4 | 5,
      registerRevealed: true,
      registerCard: mat?.card ? cardFromInstruction(mat.card.instruction, `mat-${index}`) : null,
    };
  });
}

/* Public program list sent on each player during activation (index = register). */
function registersFromProgram(
  program: ({ instruction: string } | null)[] | undefined,
  username: string,
): Register[] {
  return Array.from({ length: REGISTER_COUNT }, (_, index) => {
    const card = program?.[index] ?? null;
    return {
      registerNumber: (index + 1) as 1 | 2 | 3 | 4 | 5,
      registerRevealed: true,
      registerCard: card
        ? cardFromInstruction(card.instruction, `${username}-program-${index}`)
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

  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );

  // Board animation display state
  const [completedBoard, setCompletedBoard] = useState<Board | null>(null);
  const [animatingBoard, setAnimatingBoard] = useState<Board | null>(null);
  const [heldLiveBoard, setHeldLiveBoard] = useState<Board | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const boardAtWait = useRef<Board | null>(null);

  // Turn action status flags
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [kickConfirm, setKickConfirm] = useState<string | null>(null);
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
  const gameId = useSearchParams().get('game');
  const playerState = usePlayerState(gameId, username);
  const { players: presence, vote } = usePresence(gameId, username);

  const liveBoard = playerState?.board ?? null;
  const board = animatingBoard ?? liveBoard;

  // If the username is not set, redirect to the login page as the user is not logged in.
  useEffect(() => {
    if (!username) {
      router.replace('/login');
    }
  }, [router, username]);

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
  // What activation is waiting for someone to decide, if anything
  const choice = playerState?.choice ?? null;

  // Get the programming hand key
  const programmingHandKey =
    playerState?.type === 'PROGRAMMING_STARTED'
      ? JSON.stringify(playerState.playerMat?.hand ?? [])
      : null;

  // Did the game finish?
  const showWinner =
    finished && (completedBoard === board || (liveBoard?.steps?.length ?? 0) === 0);

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
  const cardsToPutBack = playerState?.playerMat?.cardsToPutBack ?? 0;
  const canProgram =
    isProgramming && !youSubmitted && !showingActivation && !hasPlayedCards && cardsToPutBack === 0;
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

  // Place a card in a register (click-select or drag-drop via cardId)
  const placeCard = (index: number, cardId?: string) => {
    if (locked) return;

    const card =
      cardId != null
        ? (availableHand.find((handCard) => handCard.cardId === cardId) ?? null)
        : selectedCard;
    if (card == null) return;

    const instruction = instructionFromCard(card);
    if (index === 0 && instruction && repeatsPreviousRegister(instruction)) {
      setError('AGAIN cannot be placed in register 1');
      return;
    }

    const next = registers.map((register, i) =>
      i === index ? { ...register, registerCard: card } : register,
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
    if (!gameId) {
      setError('No game was found.');
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

      const response = await submitProgram(gameId, {
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

  // Buy an upgrade (optional replace when slots are full)
  async function handleBuy(upgrade: UpgradeType, replace?: UpgradeType | null) {
    if (!gameId || !username) {
      return;
    }
    setIsUpgrading(true);
    setError(null);
    try {
      await buyUpgrade(gameId, { upgrade, replace: replace ?? null });
    } catch (buyError) {
      setError(getErrorMessage(buyError, 'Could not buy that upgrade.'));
    } finally {
      setIsUpgrading(false);
    }
  }

  // Skip an upgrade
  async function handleSkip() {
    if (!gameId || !username) {
      return;
    }
    setIsUpgrading(true);
    setError(null);
    try {
      await skipUpgrade(gameId);
    } catch (skipError) {
      setError(getErrorMessage(skipError, 'Could not skip the upgrade.'));
    } finally {
      setIsUpgrading(false);
    }
  }

  // Answer the choice activation is waiting on. The buttons stay disabled until
  // the request is done, so a double click can not send two answers.
  async function handleStartKickVote() {
    if (!gameId || !username || !kickConfirm) {
      return;
    }
    const target = kickConfirm;
    setKickConfirm(null);
    setIsVoting(true);
    setError(null);
    try {
      await startKickVote(gameId, target);
    } catch (kickError) {
      setKickConfirm(target);
      setError(getErrorMessage(kickError, 'Could not start a kick vote.'));
    } finally {
      setIsVoting(false);
    }
  }

  async function handleKickBallot(yes: boolean) {
    if (!gameId || !username) {
      return;
    }
    setIsVoting(true);
    setError(null);
    try {
      await voteOnKick(gameId, yes);
      if (!yes) {
        setKickConfirm(null);
      }
    } catch (voteError) {
      setError(getErrorMessage(voteError, 'Could not vote.'));
    } finally {
      setIsVoting(false);
    }
  }

  async function handleChoose(option: string) {
    if (!gameId || !username) {
      return;
    }
    setIsChoosing(true);
    setError(null);
    try {
      await makeChoice(gameId, { choice: option });
    } catch (chooseError) {
      setError(getErrorMessage(chooseError, 'Could not make that choice.'));
    } finally {
      setIsChoosing(false);
    }
  }

  // Get the user's board robot
  const userBoardRobot = board?.robots?.find((r) => r.username === username);

  // Get the robot model from the color
  const robotModel = robotModelFromColor(userBoardRobot?.color);

  const isActivationView = showingActivation || phase === 'ACTIVATION';
  const ownMatRegisters = registersFromMat(playerState?.playerMat?.registers);
  const ownMatFilled = ownMatRegisters.some((register) => register.registerCard !== null);

  // Activation: full program from mat (or board after mats clear). Else draft / reveals.
  const shownRegisters = isActivationView
    ? ownMatFilled
      ? ownMatRegisters
      : registersFromPlayed(board, username)
    : hasPlayedCards
      ? registersFromPlayed(board, username)
      : registers;

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
    upgrades: you?.upgrades ?? [],
    online: presence[username]?.online ?? true,
  };

  // Get the other players
  const otherPlayers: Player[] = (playerState?.players ?? [])
    .filter((gamePlayer) => gamePlayer.username !== username)
    .map((gamePlayer) => {
      const boardRobot = board?.robots?.find((robot) => robot.username === gamePlayer.username);
      const fromProgram = registersFromProgram(gamePlayer.program, gamePlayer.username);
      const programFilled = fromProgram.some((register) => register.registerCard !== null);
      const otherRegisters =
        isActivationView && programFilled
          ? fromProgram
          : registersFromPlayed(board, gamePlayer.username);
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
        register: otherRegisters,
        priorityOrder: false,
        programSubmitted: gamePlayer.programSubmitted,
        upgrades: gamePlayer.upgrades,
        online: presence[gamePlayer.username]?.online ?? true,
      };
    });

  // Offline players the game can not go on without
  const blockingPlayers = Object.values(presence)
    .filter((entry) => entry.blocking && entry.username !== username)
    .map((entry) => entry.username);

  const status: GameState['status'] = finished
    ? { state: 'over', winner: player }
    : { state: 'inprogress' };
  const hudPlayers = [player, ...otherPlayers];
  const roundNumber = playerState?.round.number ?? 0;
  const displayState: GameState =
    showingActivation || phase === 'ACTIVATION'
      ? {
          round: roundNumber,
          timerOut: false,
          programmingEndsAt: playerState?.round.programmingEndsAt ?? null,
          status,
          players: hudPlayers,
          phase: 'activation_phase',
          // While a choice waits there are no played cards to go by, so the
          // round says which register it stopped in
          activeRegister: ((activeRegisterIndex ?? playerState?.round.currentRegisterIndex ?? 0) +
            1) as 1 | 2 | 3 | 4 | 5,
        }
      : {
          round: roundNumber,
          timerOut: false,
          programmingEndsAt: playerState?.round.programmingEndsAt ?? null,
          status,
          players: hudPlayers,
          phase: phase === 'UPGRADE' ? 'upgrade_phase' : 'programming_phase',
        };

  if (showWinner) {
    const winner = playerState?.winnerUsername;

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6 text-center">
        <section className="w-full rounded-xl border-2 border-steel-dark bg-charcoal p-10">
          <h1 className="text-4xl font-bold">Game Over</h1>

          <p className="mt-4 text-xl" role="status">
            {winner === username ? 'You win!' : winner ? `${winner} wins!` : 'The match has ended.'}
          </p>

          <button
            className={`${buttonClassName} mt-8`}
            onClick={() => router.replace('/main-menu')}
            type="button"
          >
            Back to Main Menu
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-dvh max-h-dvh w-full max-w-7xl flex-col overflow-hidden p-3 text-center">
      <header className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">Game Board</h1>
        <button
          className={`${buttonClassName} shrink-0 px-3 py-1.5 text-sm`}
          onClick={() => router.push('/main-menu')}
          type="button"
        >
          Back to Main Menu
        </button>
      </header>

      <div className="min-h-0 flex-1">
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
                onBuy={(upgrade, replace) => void handleBuy(upgrade, replace)}
                onSkip={() => void handleSkip()}
                owned={you?.upgrades ?? []}
                shop={playerState?.upgradeShop ?? []}
                username={username}
              />
            ) : isProgramming &&
              !youSubmitted &&
              !showingActivation &&
              !hasPlayedCards &&
              gameId ? (
              <ProgrammingUpgradeBar
                cardsToPutBack={cardsToPutBack}
                disabled={finished || isSubmitting}
                gameId={gameId}
                hand={playerState?.playerMat?.hand ?? []}
                onError={setError}
                owned={you?.upgrades ?? []}
                usedThisRound={playerState?.playerMat?.usedThisRound ?? []}
              />
            ) : null
          }
          gameState={displayState}
          locked={locked}
          onHandOpen={() => setHandOpen((open) => !open)}
          onPlaceCard={placeCard}
          onRun={() => void handleRun()}
          onSwapRegisters={swapRegisters}
          placingCard={handOpen}
          player={player}
          activeRegisterIndex={activeRegisterIndex}
          offlineNotice={
            blockingPlayers.length > 0
              ? `Waiting for ${blockingPlayers.join(', ')}, who ${
                  blockingPlayers.length === 1 ? 'is' : 'are'
                } offline. Click their name to start a kick vote.`
              : null
          }
          onKickVote={setKickConfirm}
          waiting={waiting}
        >
          <Game
            board={board}
            onAnimationComplete={handleAnimationComplete}
            onStepIndexChange={handleStepIndexChange}
          />
        </HUD>
      </div>

      {handOpen && (
        <>
          {/* Dims the board only - pointer-events none so registers stay clickable */}
          <div className="pointer-events-none fixed inset-0 z-40 bg-black/40" />

          <div className="pointer-events-auto fixed left-1/2 top-[40%] z-50 max-h-[min(48dvh,26rem)] w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border-2 border-steel-dark bg-black/90 p-4 shadow-2xl sm:p-6">
            <button
              type="button"
              aria-label="Close hand"
              onClick={() => {
                setHandOpen(false);
                setSelectedCardId(null);
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border border-steel-dark bg-charcoal text-lg font-bold leading-none text-bone transition hover:border-cobber-light hover:text-cobber-light"
            >
              ×
            </button>

            <div className="mb-2 pr-10 text-xs font-semibold text-bone/70">
              Draw {playerState?.playerMat?.drawPileSize ?? 0} - Discard{' '}
              {playerState?.playerMat?.discardPile.length ?? 0}
              {selectedCardId ? (
                <span className="mt-1 block text-verdigris">
                  Card selected - click or drop on a register below.
                </span>
              ) : (
                <span className="mt-1 block">
                  Drag a card onto a register, or click then click a slot.
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {availableHand.map((card) => (
                <button
                  key={card.cardId}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', card.cardId);
                    event.dataTransfer.setData('text/card-id', card.cardId);
                    event.dataTransfer.effectAllowed = 'move';
                    setSelectedCardId(card.cardId);
                  }}
                  onClick={() =>
                    setSelectedCardId(selectedCardId === card.cardId ? null : card.cardId)
                  }
                  className={`flex h-24 w-16 cursor-grab items-center justify-center rounded-md border-2 text-sm font-bold text-bone transition active:cursor-grabbing ${
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

      {vote || kickConfirm ? (
        <KickVotePanel
          disabled={isVoting || finished}
          onBallot={(yes) => void handleKickBallot(yes)}
          onCancel={() => setKickConfirm(null)}
          onConfirm={() => void handleStartKickVote()}
          target={vote?.target ?? kickConfirm ?? ''}
          username={username}
          vote={vote}
        />
      ) : null}

      {/* Wait for activation animation before asking - same gate as before */}
      {choice && !showingActivation ? (
        <ChoicePanel
          choice={choice}
          disabled={isChoosing || finished}
          onChoose={(option) => void handleChoose(option)}
          username={username}
        />
      ) : null}
    </main>
  );
}
