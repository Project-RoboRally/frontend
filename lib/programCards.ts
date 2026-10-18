/**
 * Cards a player can place in the five registers.
 * A new card is another entry here; the squares render from this list.
 */

export type ProgramCard = {
  instruction: string;
  label: string;
};

export const PROGRAM_CARDS: readonly ProgramCard[] = [
  { instruction: 'MOVE_1', label: 'Move 1' },
  { instruction: 'MOVE_2', label: 'Move 2' },
  { instruction: 'LEFT_TURN', label: 'Turn left' },
  { instruction: 'RIGHT_TURN', label: 'Turn right' },
];

export const REGISTER_COUNT = 5;

export function emptyRegisters(): (string | null)[] {
  return Array.from({ length: REGISTER_COUNT }, () => null);
}

export function labelForInstruction(instruction: string) {
  return PROGRAM_CARDS.find((card) => card.instruction === instruction)?.label ?? instruction;
}
