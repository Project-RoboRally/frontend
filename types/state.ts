/* Programming cards type definitions*/
export type ProgrammingCard = MoveCard | RotateCard | UTurnCard | BackCard | PowerCard | AgainCard ;

export type MoveCard = {
    cardType: "move";
    cardStrength: number;
}

export type RotateCard = {
    cardType: "rotate";
    cardDirection: "left" | "right";
}

export type UTurnCard = {
    cardType: "uTurn";
}

export type BackCard = {
    cardType: "back";
}

export type PowerCard = {
    cardType: "power";
}

export type AgainCard = {
    cardType: "again";
}


/* Register content definitions*/
export type Register = {
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

export type RobotModel = "demolitionBot" | "hulkX90" | "spinBot" | "trundleBot" | "gymBot" | "twonky" | "zoomBot";

export const ROBOTCOLORS: Record<RobotModel, string> = {
    demolitionBot: "#FF0000",
    hulkX90: "#008000",
    spinBot: "#0000FF",
    trundleBot: "#FFFF00",
    gymBot: "#800080",
    twonky: "#00FFFF",
    zoomBot: "#80461B"
};

/* Player content definitions*/
export type Player = {
    username: string;
    robot: Robot;
    register: Register[];
    priorityOrder: boolean;
    
}


/* Game state phase definitions*/
export type GameState = {
    round: number;
    timerOut: boolean;
    status: GameStatus;
    players: Player[];
} & (UpgradePhase | ProgrammingPhase | ActivationPhase);

export type UpgradePhase = {
    phase: "upgrade_phase";
}

export type ProgrammingPhase = {
    phase: "programming_phase";
}

export type ActivationPhase = {
    phase: "activation_phase";
    activeRegister: 1 | 2 | 3 | 4 | 5;
}


/* Game status definitions*/
export type GameStatus = WaitingStatus | ProgressStatus | OverStatus;

export type WaitingStatus = {
    state: "waiting"
    playerCount: number;
}

export type ProgressStatus = {
    state: "inprogress"
}

export type OverStatus = {
    state: "over";
    winner: Player;
}
