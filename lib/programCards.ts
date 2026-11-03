/**
 * Cards a player can place in the five registers.
 * A new card is another entry here; the squares render from this list.
 */

import type { ProgrammingCard } from '@/types/cards';
import type { Register } from '@/types/register';

export type ProgramCard = {
  instruction: string;
  label: string;
};

export const PROGRAM_CARDS: readonly ProgramCard[] = [
  { instruction: 'MOVE_1', label: 'Move 1' },
  { instruction: 'MOVE_2', label: 'Move 2' },
  { instruction: 'MOVE_3', label: 'Move 3' },
  { instruction: 'LEFT_TURN', label: 'Turn left' },
  { instruction: 'RIGHT_TURN', label: 'Turn right' },
  { instruction: 'U_TURN', label: 'U-turn' },
  { instruction: 'MOVE_BACK', label: 'Back' },
  { instruction: 'POWER_UP', label: 'Power up' },
  { instruction: 'AGAIN', label: 'Again' },
  { instruction: 'ENERGY_ROUTINE', label: 'Energy' },
  { instruction: 'SPEED_ROUTINE', label: 'Speed' },
  { instruction: 'REPEAT_ROUTINE', label: 'Repeat' },
];

export const REGISTER_COUNT = 5;

const REPEAT_INSTRUCTIONS = new Set(['AGAIN', 'REPEAT_ROUTINE']);

export function repeatsPreviousRegister(instruction: string) {
  return REPEAT_INSTRUCTIONS.has(instruction);
}

export function emptyRegisters(): Register[] {
  return Array.from({ length: REGISTER_COUNT }, (_, index) => ({
    registerNumber: (index + 1) as 1 | 2 | 3 | 4 | 5,
    registerRevealed: true,
    registerCard: null,
  }));
}

export function labelForInstruction(instruction: string) {
  return PROGRAM_CARDS.find((card) => card.instruction === instruction)?.label ?? instruction;
}

export function instructionFromCard(card: ProgrammingCard): string | null {
  if (card.instruction) {
    return card.instruction;
  }

  switch (card.cardType) {
    case 'move':
      return `MOVE_${card.cardStrength}`;
    case 'rotate':
      return card.cardDirection === 'left' ? 'LEFT_TURN' : 'RIGHT_TURN';
    case 'uTurn':
      return 'U_TURN';
    case 'back':
      return 'MOVE_BACK';
    case 'power':
      return 'POWER_UP';
    case 'again':
      return 'AGAIN';
    case 'energyRoutine':
      return 'ENERGY_ROUTINE';
    case 'speedRoutine':
      return 'SPEED_ROUTINE';
    case 'repeatRoutine':
      return 'REPEAT_ROUTINE';
    default:
      return null;
  }
}

export function cardFromInstruction(instruction: string, cardId: string): ProgrammingCard {
  const base = { cardId, instruction };

  switch (instruction) {
    case 'MOVE_1':
      return { ...base, cardType: 'move', cardStrength: 1 };
    case 'MOVE_2':
      return { ...base, cardType: 'move', cardStrength: 2 };
    case 'MOVE_3':
      return { ...base, cardType: 'move', cardStrength: 3 };
    case 'LEFT_TURN':
      return { ...base, cardType: 'rotate', cardDirection: 'left' };
    case 'RIGHT_TURN':
      return { ...base, cardType: 'rotate', cardDirection: 'right' };
    case 'U_TURN':
      return { ...base, cardType: 'uTurn' };
    case 'MOVE_BACK':
      return { ...base, cardType: 'back' };
    case 'POWER_UP':
      return { ...base, cardType: 'power' };
    case 'AGAIN':
      return { ...base, cardType: 'again' };
    case 'ENERGY_ROUTINE':
      return { ...base, cardType: 'energyRoutine' };
    case 'SPEED_ROUTINE':
      return { ...base, cardType: 'speedRoutine' };
    case 'REPEAT_ROUTINE':
      return { ...base, cardType: 'repeatRoutine' };
    default:
      return { ...base, cardType: 'move', cardStrength: 1 };
  }
}

export function handCardsFromMat(hand: { instruction: string }[] | undefined): ProgrammingCard[] {
  return (hand ?? []).map((card, index) =>
    cardFromInstruction(card.instruction, `hand-${index}-${card.instruction}`),
  );
}
