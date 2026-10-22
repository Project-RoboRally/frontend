import type { BoardElement } from '@/types/board';

/**
 * Returns the image path for the highest priority board element.
 *
 * @author Caroline, Katarina, Matthias
 */

// TODO: Add images for these board elements.
const missingImages: Partial<Record<BoardElement['type'], string>> = {
  PRIORITY_ANTENNA: '#a855f7',
  REBOOT_POINT: '#3b82f6',
};

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
      'ENERGY_SPACE',
      'EMPTY_TILE'
  ];

  for (const type of priorityTypes) {
    if (elements.some((el) => el.type === type)) {
      // TODO: Add image for this element type.
      if (type in missingImages) return null;

      if (type === 'LASER_EMITTER') {
        return '/one_laser_shooter.png';
      } else if (type === 'CHECKPOINT') {
        return '/checkpoint_1.png';
      } else {
        return `/${type.toLowerCase()}.png`;
      }
    }
  }

    // Handle gears based on their rotation direction
    const gear = elements.find((element) => element.type === 'GEAR');
    if (gear) {
        return gear.rotationDirection === 'CLOCKWISE' ? '/gear_clockwise.png' : '/gear_counterclockwise.png';
    }

    // Handle push panels specifically based on their active registers
    const pushPanel = elements.find((element) => element.type === 'PUSH_PANEL');
    if (pushPanel) {
        // Note: The backend should ideally always send the registers, but we handle both possible property names for safety.
        const regs = (pushPanel as any).registers || (pushPanel as any).registerNumbers;
        if (Array.isArray(regs) && regs.length > 0) {
            // Sort them to ensure consistency, [1, 3, 5] becomes "135"
            const regString = [...regs].sort().join('');
            return `/push_panel_${regString}.png`;
        }
        return '/push_panel_1_3_5.png'; // Fallback if no specific registers are found, but this should ideally not happen if the backend always sends them.
    }

    // Handle conveyors based on their beltType
    const belt = elements.find((element) => element.type === 'CONVEYOR_BELT');
    if (belt) {
        return belt.beltType === 'BLUE' ? '/conveyor_blue_straight.png' : '/conveyor_green_straight.png';
    }

  return null;
}

/**
 * Placeholder colors for board elements.
 * TODO: Replace these with images when artwork is available.
 */
const PLACEHOLDER_COLORS: Partial<Record<BoardElement['type'], string>> = {
  PRIORITY_ANTENNA: '#a16207', // Brown
  REBOOT_POINT: '#16a34a',     // Green
};

export function getElementColor(
  elements: BoardElement[] | undefined,
): string | null {
  if (!elements) return null;

  const priorityTypes: BoardElement['type'][] = [
    'PRIORITY_ANTENNA',
    'REBOOT_POINT',
  ];

  for (const type of priorityTypes) {
    if (elements.some((element) => element.type === type)) {
      return PLACEHOLDER_COLORS[type] ?? null;
    }
  }

  return null;
}

/**
 * Determines rotation classes for directional elements.
 */
export function getElementRotation(elements: BoardElement[] | undefined): string {
  if (!elements) return '';

    const directionalElement = elements.find(
        (e) => 'direction' in e || 'pushDirection' in e
    );

    const direction = (directionalElement as any)?.direction || (directionalElement as any)?.pushDirection;

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
