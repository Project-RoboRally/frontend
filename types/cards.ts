/**
 * Type definitions for the programming cards
 *
 * @author Kerem
 */

export type ProgrammingCard =
  | MoveCard
  | RotateCard
  | UTurnCard
  | BackCard
  | PowerCard
  | AgainCard
  | EnergyRoutineCard
  | SpeedRoutineCard
  | RepeatRoutineCard;

export type MoveCard = CardId & {
  cardType: 'move';
  cardStrength: number;
};

export type RotateCard = CardId & {
  cardType: 'rotate';
  cardDirection: 'left' | 'right';
};

export type UTurnCard = CardId & {
  cardType: 'uTurn';
};

export type BackCard = CardId & {
  cardType: 'back';
};

export type PowerCard = CardId & {
  cardType: 'power';
};

export type AgainCard = CardId & {
  cardType: 'again';
};

export type EnergyRoutineCard = CardId & {
  cardType: 'energyRoutine';
};

export type SpeedRoutineCard = CardId & {
  cardType: 'speedRoutine';
};

export type RepeatRoutineCard = CardId & {
  cardType: 'repeatRoutine';
};

export type CardId = {
  cardId: string;
  instruction?: string;
};
