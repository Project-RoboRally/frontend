import type { ProgrammingCard } from "./cards";

export type Register = {
  registerNumber: 1 | 2 | 3 | 4 | 5;
  registerRevealed: boolean;
  registerCard: ProgrammingCard;
};