import type { Robot } from './robot';
import type { Register } from './register';
import type { UpgradeType } from './playerGameState';

/**
 * Type definition for the players
 *
 * @author Kerem, Elias
 */

export type Player = {
  username: string;
  robot: Robot;
  register: Register[];
  priorityOrder: boolean;
  programSubmitted?: boolean;
  upgrades?: UpgradeType[];
  /** False once the player's client stopped sending health pings. */
  online?: boolean;
};
