import type { BoardElement } from '@/types/board';

/**
 * Returns the image path for the highest priority board element.
 *
 * @author Caroline, Katarina, Matthias, Elias, August
 */

// Handle checkpoints based on their number
function checkpointImage(number: number) {
  const clamped = Math.min(6, Math.max(1, number));
  return `/boardElements/checkpoint_${clamped}.png`;
}

// Handle gears based on their rotation direction
function gearImage(type: String) {
  if (type === 'CLOCKWISE') {
    return '/boardElements/gear_clockwise.png';
  }
  return '/boardElements/gear_counterclockwise.png';
}

// Handle push panels based on the registers
function pushPanelImage(registers: number[]) {
  if (registers.toString() === [1, 3, 5].toString()) {
    return '/boardElements/push_panel_1_3_5.png';
  }
  return '/boardElements/push_panel_2_4.png';
} // Push panels do not include register numbers in the backend DTO.

// Handle the energy space tile based on the amount of enrgy left
function energySpaceImage(cubeAmount: number) {
  if (cubeAmount >= 2) {
    return '/boardElements/double_energy_space.png';
  }
  if (cubeAmount === 1) {
    return '/boardElements/single_energy_space.png';
  }
  return '/boardElements/empty_tile.png';
}

// Handle laser shooters based on the amount of lasers
function laserShooterImage(damage: number) {
  if (damage >= 3) {
    return '/boardElements/three_laser_shooter.png';
  }
  if (damage === 2) {
    return '/boardElements/two_laser_shooter.png';
  }
  return '/boardElements/one_laser_shooter.png';
}

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
    'GEAR',
    'PUSH_PANEL',
    'ENERGY_SPACE',
    'EMPTY_TILE',
  ];

  for (const type of priorityTypes) {
    const match = elements.find((el) => el.type === type);
    if (!match) continue;

    if (match.type === 'LASER_EMITTER') {
      return laserShooterImage(match.damage);
    }

    if (match.type === 'GEAR') {
      return gearImage(match.type);
    }

    if (match.type === 'PUSH_PANEL') {
      return pushPanelImage(match.registers);
    }

    if (match.type === 'ENERGY_SPACE') {
      return energySpaceImage(match.cubeAmount);
    }

    if (match.type === 'CHECKPOINT') {
      return checkpointImage(match.number);
    }
    return `/boardElements/${type.toLowerCase()}.png`;
  }

  // Handle conveyors based on their beltType
  const belt = elements.find((element) => element.type === 'CONVEYOR_BELT');
  if (belt) {
    switch (belt.beltType) {
      case 'BLUE_STRAIGHT':
        return '/boardElements/conveyor_blue_straight.png';
      case 'BLUE_LEFT_CURVE':
        return '/boardElements/conveyor_blue_left.png';
      case 'BLUE_RIGHT_CURVE':
        return '/boardElements/conveyor_blue_right.png';
      case 'BLUE_LEFT_COMBINE':
        return '/boardElements/conveyor_blue_combine_left';
      case 'BLUE_RIGHT_COMBINE':
        return '/boardElements/conveyor_blue_combine_right';
      case 'GREEN_STRAIGHT':
        return '/boardElements/conveyor_green_straight.png';
      case 'GREEN_LEFT_CURVE':
        return '/boardElements/conveyor_green_left.png';
      case 'GREEN_RIGHT_CURVE':
        return '/boardElements/conveyor_green_right.png';
      case 'GREEN_LEFT_COMBINE':
        return '/boardElements/conveyor_green_combine_left';
      case 'GREEN_RIGHT_COMBINE':
        return '/boardElements/conveyor_green_combine_right';
      default:
        return '/boardElements/empty_tile.png';
    }
  }

  return '/boardElements/empty_tile.png';
}

/**
 * Determines rotation classes for directional elements.
 */
export function getElementRotation(elements: BoardElement[] | undefined): string {
  if (!elements) return '';

  const directionalElement = elements.find((e) => 'direction' in e || 'pushDirection' in e);

  const direction =
    (directionalElement as { direction?: string; pushDirection?: string } | undefined)?.direction ||
    (directionalElement as { pushDirection?: string } | undefined)?.pushDirection;

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
