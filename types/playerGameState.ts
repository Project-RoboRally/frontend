/**
 * Type definitions for the game state the backend sends to one player over the
 * websocket.
 *
 * @author Nicoleta
 */

import type { Board, Direction } from '@/types/board';

// GAME_STARTED is sent once when the game starts; CURRENT_STATE replies to a
// new subscription, such as for after a page reload.
export type PlayerGameStateType = 'GAME_STARTED' | 'CURRENT_STATE';

export type GameStatus = 'IN_PROGRESS' | 'FINISHED';

export type Phase = 'PROGRAMMING' | 'ACTIVATION' | 'ENDED';

export type Round = {
  phase: Phase;
  // Null outside the activation phase.
  currentRegisterIndex: number | null;
  programmingTimeLimitSeconds: number;
};

// instruction is a CommandInstruction or DamageInstruction name.
export type Card = {
  type: 'PROGRAMMING' | 'DAMAGE';
  instruction: string;
};

export type PlayerRobot = {
  x: number;
  y: number;
  orientation: Direction;
  rebootedThisRound: boolean;
};

// What every player may see about another player.
export type GamePlayer = {
  username: string;
  robot: PlayerRobot;
  checkpointsReached: number;
  programSubmitted: boolean;
};

export type MatRegister = {
  index: number;
  card: Card | null;
};

// Private to the player receiving the message.
export type PlayerMat = {
  hand: Card[];
  registers: MatRegister[];
  drawPileSize: number;
  discardPile: Card[];
};

export type PlayerGameState = {
  type: PlayerGameStateType;
  gameId: string;
  status: GameStatus;
  round: Round;
  board: Board;
  players: GamePlayer[];
  you: string;
  playerMat: PlayerMat;
};
