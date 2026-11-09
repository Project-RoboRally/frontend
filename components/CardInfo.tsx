import { instructionFromCard, labelForInstruction } from '@/lib/programCards';
import type { ProgrammingCard } from '@/types/cards';

/**
 * Assigns each register with a card type (Communication between backend and frontend)
 *
 * @author Kerem, Matthias
 */

export function CardInfo({ card }: { card: ProgrammingCard | string }) {
  const instruction = typeof card === 'string' ? card : instructionFromCard(card);
  return labelForInstruction(instruction ?? '');
}
