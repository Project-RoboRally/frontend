import type { ProgrammingCard } from './cards';

/**
 * Type definition for the register
 *
 * @author Kerem
 */

export type Register = {
  registerNumber: 1 | 2 | 3 | 4 | 5;
  registerRevealed: boolean;
  registerCard: ProgrammingCard;
};
