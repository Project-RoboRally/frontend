/**
 * Type definitions for the robots
 *
 * @author Kerem, Caroline, Katarina
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
  direction: 'north' | 'south' | 'east' | 'west';
};

export type RobotModel =
  'redRobot' | 'orangeRobot' | 'greenRobot' | 'blueRobot' | 'purpleRobot' | 'pinkRobot';

export const ROBOT_COLORS: Record<RobotModel, string> = {
  redRobot: '#DD1313',
  orangeRobot: '#F16D24',
  greenRobot: '#00974E',
  blueRobot: '#3498DB',
  purpleRobot: '#A400C7',
  pinkRobot: '#FE7EDE',
};

export const ROBOT_BG_COLORS: Record<RobotModel, string> = {
  redRobot: '#7f1010',
  orangeRobot: '#993d0b',
  greenRobot: '#0d5d36',
  blueRobot: '#205477',
  purpleRobot: '#6d1a80',
  pinkRobot: '#863873',
};