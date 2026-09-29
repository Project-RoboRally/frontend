import type { GameStatus } from '@/types/gameStatus';
import type { Round } from '@/types/round';
import type { Player } from '@/types/player';

/**
 * Represents the current state of a Robo Rally game.
 *
 * @author Kerem, Matthias
 */

export type Game = {
  id: string;
  status: GameStatus;
  players: Player[];
  currentRound: Round;
};
