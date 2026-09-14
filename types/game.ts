export type Game = {
  id: string;
  name: string;
  players: string[];
};

/* Programming cards type definitions*/
type ProgrammingCard = MoveCard | RotateCard | UTurnCard | BackCard | PowerCard | AgainCard ;

type MoveCard = {
    cardType: "move";
    cardStrength: number;
}

type RotateCard = {
    cardType: "rotate";
    cardDirection: "left" | "right";
}

type UTurnCard = {
    cardType: "uTurn";
}

type BackCard = {
    cardType: "back";
}

type PowerCard = {
    cardType: "power";
}

type AgainCard = {
    cardType: "again";
}


/* Register content definitions*/
type Register = {
    registerNumber: 1 | 2 | 3 | 4 | 5;
    registerRevealed: boolean;
    registerCard: ProgrammingCard;
}


/* Robot content definitions*/
export type Robot = {
    robotModel: RobotModel;
    position: RobotPosition;
    checkpointsCollected: number;
    energycubesCollected: number;
    outOfGame: boolean;
    damageCount: number;
}

export type RobotPosition = {
    row: number;
    column: number;
    direction: "north" | "south" | "east" | "west";
}

export type RobotModel = "Demolition_Bot" | "Hulk_X90" | "Spin_Bot" | "Trundle_Bot" | "Gym_Bot" | "Twonky" | "Zoom_Bot";

export const robotColors: Record<RobotModel, string> = {
    Demolition_Bot: "#FF0000",
    Hulk_X90: "#008000",
    Spin_Bot: "#0000FF",
    Trundle_Bot: "#FFFF00",
    Gym_Bot: "#800080",
    Twonky: "#00FFFF",
    Zoom_Bot: "#80461B"
};

/* Player content definitions*/
type Player = {
    username: string;
    turn: boolean;
    robot: Robot;
}


/* Game phase definitions*/
type GameState = {
    round: number;
    timerOut: boolean;
    status: GameStatus;
} & (UpgradePhase | ProgrammingPhase | ActivationPhase);

type UpgradePhase = {
    phase: "upgrade_phase";
}

type ProgrammingPhase = {
    phase: "programming_phase";
}

type ActivationPhase = {
    phase: "activation_phase";
    activeRegister: 1 | 2 | 3 | 4 | 5;
}


/* Game status definitions*/
type GameStatus = WaitingStatus | ProgressStatus | OverStatus;

type WaitingStatus = {
    state: "waiting"
    playerCount: number;
}

type ProgressStatus = {
    state: "inprogress"
}

type OverStatus = {
    state: "over";
    winner: Player;
}
