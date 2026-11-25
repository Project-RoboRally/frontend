/**
 * Type definitions for the robots
 *
 * @author Kerem, Caroline, Katarina, Matthias, Sebastian
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

// The colors are CSS variables (see globals.css) so colorblind mode can swap them.
const robotColorVar = (model: RobotModel, suffix = '') =>
  `var(--color-robot-${model.replace('Robot', '')}${suffix})`;

const ROBOT_MODELS: RobotModel[] = [
  'redRobot',
  'orangeRobot',
  'greenRobot',
  'blueRobot',
  'purpleRobot',
  'pinkRobot',
];

export const ROBOT_COLORS = Object.fromEntries(
  ROBOT_MODELS.map((model) => [model, robotColorVar(model)]),
) as Record<RobotModel, string>;

export const ROBOT_BG_COLORS = Object.fromEntries(
  ROBOT_MODELS.map((model) => [model, robotColorVar(model, '-bg')]),
) as Record<RobotModel, string>;
