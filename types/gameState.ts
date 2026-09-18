import type { Player } from "./player";

export type GameState = {
  round: number;
  timerOut: boolean;
  status: GameStatus;
  players: Player[];
} & (UpgradePhase | ProgrammingPhase | ActivationPhase);

export type UpgradePhase = {
  phase: "upgrade_phase";
};

export type ProgrammingPhase = {
  phase: "programming_phase";
};

export type ActivationPhase = {
  phase: "activation_phase";
  activeRegister: 1 | 2 | 3 | 4 | 5;
};

export type GameStatus =
  | WaitingStatus
  | ProgressStatus
  | OverStatus;

export type WaitingStatus = {
  state: "waiting";
  playerCount: number;
};

export type ProgressStatus = {
  state: "inprogress";
};

export type OverStatus = {
  state: "over";
  winner: Player;
};