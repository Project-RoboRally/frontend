import type { BoardElement } from '@/types/board';

/**
 * Returns the image path for the highest priority board element.
 *
 * @author Caroline, Katarina, Matthias
 */

function checkpointImage(number: number) {
  const clamped = Math.min(6, Math.max(1, number));
  return `/checkpoint_${clamped}.png`;
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
  if (!elements || elements.length === 0) return null;

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

  // Push panels do not include register numbers in the backend DTO.
  if (elements.some((element) => element.type === 'PUSH_PANEL')) {
    return '/push_panel_1_3_5.png';
  }

  // Handle the priority antenna tile
  if (elements.some((element) => element.type === 'PRIORITY_ANTENNA')) {
    return '/priority_antenna.png';
  }

  // Handle the energy space tile
  if (elements.some((element) => element.type === 'ENERGY_SPACE')) {
    return '/double_energy_space.png';
  }

  // Handle conveyors based on their beltType
  const belt = elements.find((element) => element.type === 'CONVEYOR_BELT');
  if (belt) {
    return belt.beltType === 'BLUE'
      ? '/conveyor_blue_straight.png'
      : '/conveyor_green_straight.png';
  }

  return null;
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
