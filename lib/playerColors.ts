import type { PlayerColor } from '@/types/lobby';

/**
 * The robot colors a player can pick, in the same order as the backend's PlayerColor enum.
 *
 * @author August
 */
export const PLAYER_COLORS: PlayerColor[] = ['RED', 'BLUE', 'PINK', 'GREEN', 'PURPLE', 'ORANGE'];

export function robotSprite(color: PlayerColor) {
  return `/${color.toLowerCase()}_Robot.png`;
}

export function colorLabel(color: PlayerColor) {
  return color.charAt(0) + color.slice(1).toLowerCase();
}
