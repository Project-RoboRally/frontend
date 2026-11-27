'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';
import {
  buyUpgrade,
  makeChoice,
  skipUpgrade,
  startKickVote,
  submitProgram,
  voteOnKick,
} from '@/lib/api/game';
import { laserBeats, lastFiredRegister, type LaserBeat, type Shooter } from '@/lib/lasers';
import { activePlayedRegister } from '@/lib/playedRegisters';
import {
  emptyRegisters,
  handCardsFromMat,
  instructionFromCard,
  REGISTER_COUNT,
  repeatsPreviousRegister,
} from '@/lib/programCards';
import { usePlayerState } from '@/lib/socket/usePlayerState';
import { usePresence } from '@/lib/socket/usePresence';
import { getUsername } from '@/lib/username';
import type { Board } from '@/types/board';
import type { UpgradeType } from '@/types/playerGameState';
import type { Register } from '@/types/register';

import {
  hudDisplayState,
  offlineNoticeFor,
  othersAsHudPlayers,
  shownRegistersForYou,
  youAsHudPlayer,
} from './hudPlayers';

/**
 * All live state and actions for a running game.
 *
 * @author Caroline, Katarina, Kerem, Elias
 */
export function useGame() {
  const router = useRouter();
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );
  const gameId = useSearchParams().get('game');
  const playerState = usePlayerState(gameId, username);
  const { players: presence, vote } = usePresence(gameId, username);

  const [error, setError] = useState<string | null>(null);
  const [completedBoard, setCompletedBoard] = useState<Board | null>(null);
  const [animatingBoard, setAnimatingBoard] = useState<Board | null>(null);
  const [heldLiveBoard, setHeldLiveBoard] = useState<Board | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [animatingLasers, setAnimatingLasers] = useState<LaserBeat[]>([]);
  const [laserRegister, setLaserRegister] = useState<number | null>(null);
  // Activation arrives in several messages when it pauses for a choice, so
  // remember which registers already fired this round.
  const [lasersFired, setLasersFired] = useState({ round: -1, upTo: -1 });
  const [registers, setRegisters] = useState<Register[]>(emptyRegisters);
  const [handOpen, setHandOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [appliedHandKey, setAppliedHandKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [kickConfirm, setKickConfirm] = useState<string | null>(null);
  const [seenPhase, setSeenPhase] = useState<string | undefined>(undefined);
  const boardAtWait = useRef<Board | null>(null);

  const liveBoard = playerState?.board ?? null;
  const board = animatingBoard ?? liveBoard;

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
    setSelectedCardId(null);
    setHandOpen(false);
    setIsWaiting(false);
    setError(null);
  }, [board, isWaiting]);

  const finished = playerState?.status === 'FINISHED';
  const phase = playerState?.round.phase;
  const you = playerState?.players.find((player) => player.username === username);
  const youSubmitted = you?.programSubmitted ?? false;
  const programmingHandKey =
    playerState?.type === 'PROGRAMMING_STARTED'
      ? JSON.stringify(playerState.playerMat?.hand ?? [])
      : null;

  if (liveBoard !== heldLiveBoard) {
    setHeldLiveBoard(liveBoard);
    let beats: LaserBeat[] = [];
    if (playerState && (liveBoard?.registers?.length ?? 0) > 0) {
      const round = playerState.round.number;
      const firedBefore = lasersFired.round === round ? lasersFired.upTo : -1;
      const firedUpTo = lastFiredRegister(
        playerState.round.currentRegisterIndex,
        playerState.choice?.type ?? null,
        liveBoard?.registers,
      );
      beats = laserBeats(
        liveBoard?.registers,
        liveBoard?.steps?.length ?? 0,
        firedBefore,
        firedUpTo,
      );
      if (firedUpTo > firedBefore) {
        setLasersFired({ round, upTo: firedUpTo });
      }
    }
    setAnimatingLasers(beats);
    if ((liveBoard?.steps?.length ?? 0) > 0 || beats.length > 0) {
      setAnimatingBoard(liveBoard);
    }
  }

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

  const handleStepIndexChange = useCallback(
    (index: number | null, firingRegister: number | null = null) => {
      setStepIndex(index);
      setLaserRegister(firingRegister);
    },
    [],
  );

  const handleAnimationComplete = useCallback((animatedBoard: Board) => {
    setCompletedBoard(animatedBoard);
    setAnimatingBoard((current) => (current === animatedBoard ? null : current));
    setStepIndex(null);
    setLaserRegister(null);
  }, []);

  const shooters: Record<string, Shooter> = Object.fromEntries(
    (playerState?.players ?? []).map((player) => [
      player.username,
      { upgrades: player.upgrades ?? [], rebooted: player.robot.rebootedThisRound },
    ]),
  );

  const showingActivation =
    ((animatingBoard?.steps?.length ?? 0) > 0 || animatingLasers.length > 0) &&
    animatingBoard !== null &&
    stepIndex !== null;
  const hasPlayedCards = (board?.registers?.length ?? 0) > 0;
  const activeRegisterIndex = laserRegister ?? activePlayedRegister(board?.registers, stepIndex);
  const showWinner =
    finished && (completedBoard === board || (liveBoard?.steps?.length ?? 0) === 0);

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
  const cardsToPutBack = playerState?.playerMat?.cardsToPutBack ?? 0;
  const canProgram =
    phase === 'PROGRAMMING' &&
    !youSubmitted &&
    !showingActivation &&
    !hasPlayedCards &&
    cardsToPutBack === 0;
  const locked = isSubmitting || isWaiting || !playerState || finished || !canProgram;
  const canRun = filledCount === REGISTER_COUNT && !locked && !repeatInRegisterOne;
  const waiting = isWaiting || (youSubmitted && phase === 'PROGRAMMING' && !finished);

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
      const response = await submitProgram(gameId, { registers: instructions });
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

  const isActivationView = showingActivation || phase === 'ACTIVATION';
  const player =
    username == null
      ? null
      : youAsHudPlayer(
          username,
          board,
          you,
          shownRegistersForYou(
            isActivationView,
            hasPlayedCards,
            board,
            username,
            playerState?.playerMat?.registers,
            registers,
          ),
          presence[username]?.online,
        );
  const otherPlayers =
    username == null
      ? []
      : othersAsHudPlayers(username, board, playerState?.players ?? [], isActivationView, presence);
  const displayState =
    player == null
      ? null
      : hudDisplayState(
          playerState,
          [player, ...otherPlayers],
          finished,
          player,
          showingActivation,
          activeRegisterIndex,
        );

  return {
    router,
    username,
    gameId,
    playerState,
    player,
    displayState,
    board,
    error,
    setError,
    finished,
    phase,
    you,
    youSubmitted,
    energy: you?.energy ?? 0,
    choice: playerState?.choice ?? null,
    vote,
    kickConfirm,
    setKickConfirm,
    isVoting,
    isUpgrading,
    isChoosing,
    isSubmitting,
    showingActivation,
    hasPlayedCards,
    activeRegisterIndex,
    showWinner,
    availableHand,
    handOpen,
    setHandOpen,
    selectedCardId,
    setSelectedCardId,
    canRun: canRun,
    locked,
    waiting,
    swapRegisters,
    placeCard,
    handleRun,
    handleBuy,
    handleSkip,
    handleChoose,
    handleStartKickVote,
    handleKickBallot,
    handleAnimationComplete,
    handleStepIndexChange,
    laserBeats: animatingLasers,
    shooters,
    offlineNotice: username ? offlineNoticeFor(presence, username) : null,
  };
}
