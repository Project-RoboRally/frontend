/**
 * Verifies action order and timing across register boundaries, including cards
 * that share a board pose and laser volleys that follow board movement.
 *
 * @Author Matthias
 */
import { expect, it } from 'vitest';
import type { Board, PlayedCard } from '@/types/board';
import { registerPlayback } from './registerPlayback';

function played(instruction: string, firstStep: number, stepCount: number): PlayedCard {
  return { username: 'p', card: { type: 'PROGRAMMING', instruction }, firstStep, stepCount };
}

it('plays a multi-step card in one second and preserves stationary cards across register boundaries', () => {
  const board: Board = {
    width: 4,
    height: 1,
    robots: [],
    spaces: [],
    steps: [[], [], [], []],
    registers: [
      { register: 0, cards: [played('MOVE_3', 0, 3), played('POWER_UP', 3, 0)] },
      { register: 1, cards: [played('ENERGY_ROUTINE', 3, 0)] },
    ],
  };
  const frames = registerPlayback(board, [
    { register: 0, afterStep: 3 },
    { register: 1, afterStep: 4 },
  ]);
  expect(frames.map((f) => f.card?.card.instruction ?? (f.laser ? 'laser' : 'board'))).toEqual([
    'MOVE_3',
    'MOVE_3',
    'MOVE_3',
    'POWER_UP',
    'laser',
    'ENERGY_ROUTINE',
    'board',
    'laser',
  ]);
  expect(frames.map((f) => f.pose)).toEqual([0, 1, 2, 2, 2, 2, 3, 3]);
  expect(frames.slice(0, 3).reduce((sum, f) => sum + f.duration, 0)).toBeCloseTo(1000);
  expect(frames.slice(3).every((f) => f.duration === 1000)).toBe(true);
});
