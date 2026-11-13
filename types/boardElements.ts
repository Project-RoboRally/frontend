import type { BoardElement } from '@/types/board';

/**
 * Returns the image path for the highest priority board element.
 *
 * @author Caroline, Katarina, Matthias
 */

// Handle checkpoints based on the number on the flag
function checkpointImage(number: number) {
  const clamped = Math.min(6, Math.max(1, number));
  return `/boardElements/checkpoint_${clamped}.png`;
}

// Handle laser shooters based on the amount og laser beams
function laserShooterImage(damage: number) {
  if (damage >= 3) {
    return '/boardElements/three_laser_shooter.png';
  }
  if (damage === 2) {
    return '/boardElements/two_laser_shooter.png';
  }
  return '/boardElements/one_laser_shooter.png';
}

// Handle energy spaces based on their cube amount
function energySpaceImage(cubeAmount: number) {
  if (cubeAmount >= 2) {
    return '/boardElements/double_energy_space.png';
  }
  if (cubeAmount === 1) {
    return '/boardElements/single_energy_space.png';
  }
  return '/boardElements/empty_tile.png';
}

// Handle gears based on their rotation direction
function gearImage(rotationDirection: string) {
  if (rotationDirection === 'CLOCKWISE') {
    return '/boardElements/gear_clockwise.png';
  }
  return '/boardElements/gear_counterclockwise.png';
}

// Handle push panels based on the current register
function pushPanelImage(registers: number[]) {
  if (registers.toString() === [1, 3, 5].toString()) {
    return '/boardElements/push_panel_1_3_5.png';
  }
  return '/boardElements/push_panel_2_4.png';
}

// Handle walls based on if it is a single wall or a corner
function wallImage() {
  return '/boardElements/single_wall.png';
  // TODO: Add parameter for wall corner or single wall
}

// Inputs the correct image for the elements on the board
export function getElementImage(elements: BoardElement[] | undefined): string | null {
  if (!elements || elements.length === 0) return '/boardElements/empty_tile.png';

  // Priority order for elements
  const priorityTypes: BoardElement['type'][] = [
    'CHECKPOINT',
    'STARTING_POINT',
    'PIT',
    'PRIORITY_ANTENNA',
    'REBOOT_POINT',
    'LASER_EMITTER',
    'ENERGY_SPACE',
    'GEAR',
    'PUSH_PANEL',
    'WALL',
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

    if (match.type === 'ENERGY_SPACE') {
      return energySpaceImage(match.cubeAmount);
    }

    if (match.type === 'GEAR') {
      return gearImage(match.rotationDirection);
    }

    if (match.type === 'PUSH_PANEL') {
      return pushPanelImage(match.registers);
    }

    if (match.type == 'WALL') {
      return wallImage();
    }

    return `/${type.toLowerCase()}.png`;
  }

  // Handle conveyors based on their beltType
  const belt = elements.find((element) => element.type === 'CONVEYOR_BELT');
  if (belt?.beltType === 'GREEN_STRAIGHT') {
    return '/boardElements/conveyor_green_straight.png';
  }
  if (belt?.beltType === 'GREEN_LEFT_CURVE') {
    return '/boardElements/conveyor_green_left.png';
  }
  if (belt?.beltType === 'GREEN_RIGHT_CURVE') {
    return '/boardElements/conveyor_green_right.png';
  }
  if (belt?.beltType === 'BLUE_STRAIGHT') {
    return '/boardElements/conveyor_blue_straight.png';
  }
  if (belt?.beltType === 'BLUE_LEFT_CURVE') {
    return '/boardElements/conveyor_blue_left.png';
  }
  if (belt?.beltType === 'BLUE_RIGHT_CURVE') {
    return '/boardElements/conveyor_blue_right.png';
  }

  return '/boardElements/empty_tile.png';
}

/**
 * Determines rotation classes for directional elements.
 */
export function getElementRotation(elements: BoardElement[] | undefined): string {
  if (!elements) return '';

  const directionalElement = elements.find(
    (e) => 'direction' in e || 'pushDirection' in e || 'side' in e,
  );

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
