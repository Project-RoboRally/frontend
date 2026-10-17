/**
 * Type definitions for the board sent by the backend over the websocket.
 * Coordinates use the backend's convention: x grows east, y grows south.
 *
 * @author Elias
 */

import type { PlayerColor } from '@/types/lobby';

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type BoardElement =
  | { type: 'WALL'; side: Direction }
  | { type: 'CONVEYOR_BELT'; direction: Direction; beltType: 'GREEN' | 'BLUE'; length: number }
  | { type: 'GEAR'; rotationDirection: 'CLOCKWISE' | 'COUNTERCLOCKWISE' }
  | { type: 'LASER_EMITTER'; direction: Direction; damage: number }
  | { type: 'PUSH_PANEL'; pushDirection: Direction }
  | { type: 'CHECKPOINT'; number: number }
  | { type: 'ENERGY_SPACE'; cubeAmount: number }
  | { type: 'PIT' }
  | { type: 'STARTING_POINT' }
  | { type: 'REBOOT_POINT' }
  | { type: 'PRIORITY_ANTENNA' };

export type BoardSpace = {
  x: number;
  y: number;
  elements: BoardElement[];
};

export type BoardRobot = {
  username: string;
  color: PlayerColor;
  x: number;
  y: number;
  orientation: Direction;
};

export type Board = {
  width: number;
  height: number;
  spaces: BoardSpace[];
  robots: BoardRobot[];
};
