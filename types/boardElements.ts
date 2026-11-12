import type { BoardElement } from '@/types/board';

/**
 * Returns the image path for the highest priority board element.
 *
 * @author Caroline, Katarina, Matthias
 */

function checkpointImage(number: number) {
  const clamped = Math.min(6, Math.max(1, number));
  return '/checkpoint_${clamped}.png';
}

function laserShooterImage(damage: number) {
  if (damage >= 3) {
    return '/three_laser_shooter.png';
  }
  if (damage === 2) {
    return '/two_laser_shooter.png';
  }
  return '/one_laser_shooter.png';
}

export function getElementImage(elements: BoardElement[] | undefined): string | null {
  if (!elements || elements.length === 0) return '/empty_tiles.png';

  // Priority order for elements
  const priorityTypes: BoardElement['type'][] = [
    'CHECKPOINT',
    'STARTING_POINT',
    'PIT',
    'PRIORITY_ANTENNA',
    'REBOOT_POINT',
    'LASER_EMITTER',
    'EMPTY_TILE',
  ];

  for (const type of priorityTypes) {
    const match = elements.find((el) => el.type === type);
    if (!match) continue;

    if (match.type === 'LASER_EMITTER') {
      return laserShooterImage(match.damage);
    }
    if (match.type === 'CHECKPOINT') {
      return checkpointImage(match.number);
    }
    return `/${type.toLowerCase()}.png`;
  }

  // Handle gears based on their rotation direction
  const gear = elements.find((element) => element.type === 'GEAR');
  if (gear) {
    return gear.rotationDirection === 'CLOCKWISE'
      ? '/gear_clockwise.png'
      : '/gear_counterclockwise.png';
  }

  // Handle push panels based on the current register
  const push_panel = elements.find((element) => element.type === 'PUSH_PANEL');
  if (push_panel) {
    return push_panel.registers.toString() === [1, 3, 5].toString()
      ? '/push_panel_1_3_5.png'
      : '/push_panel_2_4.png';
  }

  // Handle energy spaces based on their cube amount
  const energy_space = elements.find((element) => element.type === 'ENERGY_SPACE');
  if (energy_space) {
    return energy_space.cubeAmount === 2
      ? '/double_energy_space.png'
      : '/single_energy_space.png';
  }

  // Handle conveyors based on their beltType
  const belt = elements.find((element) => element.type === 'CONVEYOR_BELT');
  if (belt?.beltType === 'GREEN_STRAIGHT') {
      return '/conveyor_green_straight.png';
  }
  if (belt?.beltType === 'GREEN_LEFT_CURVE') {
      return '/conveyor_green_left.png';
  }
  if (belt?.beltType === 'GREEN_RIGHT_CURVE') {
      return '/conveyor_green_right.png';
  }
  if (belt?.beltType === 'BLUE_STRAIGHT') {
      return '/conveyor_blue_straight.png';
  }
  if (belt?.beltType === 'BLUE_LEFT_CURVE') {
      return '/conveyor_blue_left.png';
  }
  if (belt?.beltType === 'BLUE_RIGHT_CURVE') {
      return '/conveyor_blue_right.png';
  }

  const wall = elements.find((element) => element.type === 'WALL');
  if (wall) {
    return '/single_wall.png';
  } // TODO: Add parameter for wall corner or single wall

  return '/empty_tile.png';
}

/**
 * Determines rotation classes for directional elements.
 */
export function getElementRotation(elements: BoardElement[] | undefined): string {
  if (!elements) return '';

  const directionalElement = elements.find((e) => 'direction' in e || 'pushDirection' in e || 'side' in e);

  const direction =
    (directionalElement as { direction?: string; pushDirection?: string } | undefined)?.direction ||
    (directionalElement as { pushDirection?: string } | undefined)?.pushDirection ||
    (directionalElement as { side?: string } | undefined)?.side;

  switch (direction) {
    case 'EAST':
      return 'rotate-90';
    case 'SOUTH':
      return 'rotate-180';
    case 'WEST':
      return '-rotate-90';
    default:
      return '';
  }
}