import type { Robot } from './robot';
import type { Register } from './register';

/**
 * Type definition for the players
 *
 * @author Kerem
 */

export type Player = {
  username: string;
  robot: Robot;
  register: Register[];
  priorityOrder: boolean;
};
