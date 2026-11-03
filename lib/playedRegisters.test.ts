import { describe, expect, it } from 'vitest';

import { activePlayedRegister } from './playedRegisters';
import type { BoardRegister } from '@/types/board';

const registers: BoardRegister[] = [
  {
    register: 0,
    cards: [
      {
        username: 'alice',
        card: { type: 'PROGRAMMING', instruction: 'MOVE_1' },
        firstStep: 0,
        stepCount: 1,
      },
      {
        username: 'bob',
        card: { type: 'PROGRAMMING', instruction: 'POWER_UP' },
        firstStep: 1,
        stepCount: 0,
      },
    ],
  },
  {
    register: 1,
    cards: [
      {
        username: 'alice',
        card: { type: 'PROGRAMMING', instruction: 'LEFT_TURN' },
        firstStep: 1,
        stepCount: 1,
      },
    ],
  },
];

describe('activePlayedRegister', () => {
  it('returns null when there is no current frame', () => {
    expect(activePlayedRegister(registers, null)).toBeNull();
  });

  it('prefers a card that occupies the current animation frame', () => {
    expect(activePlayedRegister(registers, 0)).toBe(0);
    expect(activePlayedRegister(registers, 1)).toBe(1);
  });

  it('falls back to energy cards with no frames', () => {
    const energyOnly: BoardRegister[] = [
      {
        register: 2,
        cards: [
          {
            username: 'alice',
            card: { type: 'PROGRAMMING', instruction: 'ENERGY_ROUTINE' },
            firstStep: 4,
            stepCount: 0,
          },
        ],
      },
    ];

    expect(activePlayedRegister(energyOnly, 4)).toBe(2);
  });
});
