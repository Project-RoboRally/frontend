import type { Robot } from "./robot";
import type { Register } from "./register";
import type { ProgrammingCard } from "./cards";

/**
 * Type definition for the players
 * 
 * @author Kerem
 */

export type Player = {
  username: string;
  robot: Robot;
  deck: ProgrammingCard[];
  hand: ProgrammingCard[];
  register: Register[];
  discardPile: ProgrammingCard[];
  priorityOrder: boolean;
};