export type ProgrammingCard =
  | MoveCard
  | RotateCard
  | UTurnCard
  | BackCard
  | PowerCard
  | AgainCard;

export type MoveCard = {
  cardType: "move";
  cardStrength: number;
};

export type RotateCard = {
  cardType: "rotate";
  cardDirection: "left" | "right";
};

export type UTurnCard = {
  cardType: "uTurn";
};

export type BackCard = {
  cardType: "back";
};

export type PowerCard = {
  cardType: "power";
};

export type AgainCard = {
  cardType: "again";
};