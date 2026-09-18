export type Robot = {
  robotModel: RobotModel;
  position: RobotPosition;
  checkpointsCollected: number;
  energycubesCollected: number;
  outOfGame: boolean;
  damageCount: number;
};

export type RobotPosition = {
  row: number;
  column: number;
  direction: "north" | "south" | "east" | "west";
};

export type RobotModel =
  | "demolitionBot"
  | "hulkX90"
  | "spinBot"
  | "trundleBot"
  | "gymBot"
  | "twonky"
  | "zoomBot";

export const ROBOTCOLORS: Record<RobotModel, string> = {
  demolitionBot: "#FF0000",
  hulkX90: "#008000",
  spinBot: "#0000FF",
  trundleBot: "#FFFF00",
  gymBot: "#800080",
  twonky: "#00FFFF",
  zoomBot: "#80461B",
};