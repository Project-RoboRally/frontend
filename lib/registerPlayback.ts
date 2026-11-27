/**
 * Builds the playback timeline from register cards, robot poses and laser volleys.
 * Movement frames share the card's one-second duration. Stationary cards hold the previous pose.
 *
 * @Author Matthias
 */
import type { Board, PlayedCard } from '@/types/board';
import type { LaserBeat } from './lasers';

export const ACTION_MS = 1000;

export interface PlaybackFrame {
  // -1 keeps the pose shown before the first movement.
  pose: number;
  register: number | null;
  card?: PlayedCard;
  laser?: boolean;
  duration: number;
}

export function registerPlayback(board: Board, lasers: LaserBeat[]): PlaybackFrame[] {
  const frames: PlaybackFrame[] = [];
  const stepCount = board.steps?.length ?? 0;
  let nextStep = 0;

  function moveUntil(end: number, register: number | null, card?: PlayedCard) {
    while (nextStep < Math.min(end, stepCount)) {
      frames.push({
        pose: nextStep++,
        register,
        card,
        duration: card ? ACTION_MS / card.stepCount : ACTION_MS,
      });
    }
  }

  const registers = new Set([
    ...(board.registers ?? []).map((entry) => entry.register),
    ...lasers.map((laser) => laser.register),
  ]);
  let previous: number | null = null;
  for (const register of [...registers].sort((a, b) => a - b)) {
    const cards = board.registers?.find((entry) => entry.register === register)?.cards ?? [];
    for (const card of cards) {
      moveUntil(card.firstStep, previous);
      previous = register;
      if (card.stepCount === 0) {
        frames.push({ pose: nextStep - 1, register, card, duration: ACTION_MS });
      } else {
        moveUntil(card.firstStep + card.stepCount, register, card);
      }
    }
    const laser = lasers.find((beat) => beat.register === register);
    if (laser) {
      moveUntil(laser.afterStep, register);
      frames.push({ pose: nextStep - 1, register, laser: true, duration: ACTION_MS });
    }
    previous = register;
  }
  moveUntil(stepCount, previous);
  return frames;
}
