/**
 * Declaring the different robots
 * 
 * @author Caroline, Katarina
 */

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
  | "redRobot"
  | "orangeRobot"
  | "greenRobot"
  | "blueRobot"
  | "purpleRobot"
  | "pinkRobot";

export const ROBOTCOLORS: Record<RobotModel, string> = {
  redRobot: "#DD1313",
  orangeRobot: "#F16D24",
  greenRobot: "#00974E",
  blueRobot: "#3498DB",
  purpleRobot: "#A400C7",
  pinkRobot: "#FE7EDE",
};