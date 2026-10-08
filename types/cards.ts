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
  | AgainCard;

export type MoveCard = CardId & {
  cardType: "move";
  cardStrength: number;
};

export type RotateCard = CardId & {
  cardType: "rotate";
  cardDirection: "left" | "right";
};

export type UTurnCard = CardId & {
  cardType: "uTurn";
};

export type BackCard = CardId & {
  cardType: "back";
};

export type PowerCard = CardId & {
  cardType: "power";
};

export type AgainCard = CardId & {
  cardType: "again";
};

export type CardId = {
  cardId: string;
}