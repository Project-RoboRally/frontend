import type { PlayerColor } from '@/types/lobby';
import type { RobotModel } from '@/types/robot';

/**
 * The robot colors a player can pick, in the same order as the backend's PlayerColor enum.
 *
 * @author August, Sebastian
 */
export const PLAYER_COLORS: PlayerColor[] = ['RED', 'BLUE', 'PINK', 'GREEN', 'PURPLE', 'ORANGE'];

export function robotSprite(color: PlayerColor) {
  return `/${color.toLowerCase()}_Robot.png`;
}

/** Sprite for a HUD robot model such as 'redRobot', which is named like the PlayerColor. */
export function robotModelSprite(model: RobotModel) {
  return `/${model.replace('Robot', '')}_Robot.png`;
}

export function colorLabel(color: PlayerColor) {
  return color.charAt(0) + color.slice(1).toLowerCase();
}
