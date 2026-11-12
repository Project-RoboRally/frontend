/**
 * Type definitions for the game state the backend sends to one player over the
 * websocket.
 *
 * @author Nicoleta, Elias
 */

import type { Board, Direction } from '@/types/board';

// GAME_STARTED is sent once when the game starts; CURRENT_STATE replies to a
// new subscription, such as for after a page reload.
export type PlayerGameStateType =
  | 'GAME_STARTED'
  | 'CURRENT_STATE'
  | 'UPGRADE_TURN'
  | 'UPGRADE_USED'
  | 'PROGRAMMING_STARTED'
  | 'CHOICE_REQUIRED'
  | 'ROUND_STARTED'
  | 'TIMER_STARTED';

export type GameStatus = 'IN_PROGRESS' | 'FINISHED';

export type Phase = 'UPGRADE' | 'PROGRAMMING' | 'ACTIVATION' | 'ENDED';

export type UpgradeType =
  | 'ENERGY_ROUTINE'
  | 'SPEED_ROUTINE'
  | 'REPEAT_ROUTINE'
  | 'ADMIN_PRIVILEGE'
  | 'BLUE_SCREEN_OF_DEATH'
  | 'BRAKES'
  | 'CACHE_MEMORY'
  | 'CORRUPTION_WAVE'
  | 'CRAB_LEGS'
  | 'DEFLECTOR_SHIELD'
  | 'DEFRAG_GIZMO'
  | 'DOUBLE_BARREL_LASER'
  | 'FIREWALL'
  | 'HOVER_UNIT'
  | 'MEMORY_STICK'
  | 'MINI_HOWITZER'
  | 'MODULAR_CHASSIS'
  | 'PRESSOR_BEAM'
  | 'RAIL_GUN'
  | 'RAMMING_GEAR'
  | 'REAR_LASER'
  | 'SCRAMBLER'
  | 'SIDE_ARMS'
  | 'TELEPORTER'
  | 'TRACTOR_BEAM'
  | 'TROJAN_NEEDLER'
  | 'VIRUS_MODULE'
  | 'BOINK'
  | 'HACK'
  | 'MANUAL_SORT'
  | 'MEMORY_SWAP'
  | 'REBOOT'
  | 'RECHARGE'
  | 'RECOMPILE'
  | 'REFRESH'
  | 'SANDBOX_ROUTINE'
  | 'SPAM_BLOCKER'
  | 'SPAM_FOLDER'
  | 'WEASEL_ROUTINE'
  | 'ZOOP';

export type Upgrade = {
  type: UpgradeType;
  cost: number;
  kind: 'PERMANENT' | 'TEMPORARY';
};

// Something activation can stop and ask a player to decide.
export type ChoiceType =
  | 'SANDBOX_ACTION'
  | 'WEASEL_ACTION'
  | 'REBOOT_FACING'
  | 'REGISTER_UPGRADE'
  | 'TURN_UPGRADE'
  | 'ZOOP_FACING'
  | 'BOINK_DIRECTION'
  | 'REFRESH_CARD'
  | 'MOVE_ONE'
  | 'TELEPORT'
  | 'WEAPON_UPGRADE'
  | 'SIDE_ARMS'
  | 'MODULAR_CHASSIS';

// The decision activation is waiting on. options are the only answers the
// backend accepts, so the frontend just shows them.
export type PendingChoice = {
  username: string;
  type: ChoiceType;
  options: string[];
};

export type Round = {
  // 1 for the first round of the game.
  number: number;
  phase: Phase;
  // Null outside the activation phase.
  currentRegisterIndex: number | null;
  programmingEndsAt: number | null;
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
  energy: number;
  programSubmitted: boolean;
  upgrades: UpgradeType[];
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
  upgradeShop: Upgrade[];
  currentBuyer: string | null;
  // Sent with every message, not only CHOICE_REQUIRED, so a reload still shows
  // it. Null while activation is not waiting on anyone.
  choice: PendingChoice | null;
  winnerUsername: string | null;
};
