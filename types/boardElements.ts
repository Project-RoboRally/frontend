import type { BoardElement } from '@/types/board';

/**
 * Returns the image path for the highest priority board element.
 *
 * @author Caroline, Katarina
 */

// Map each element type to its corresponding image path in your public folder
export function getElementImage(elements: BoardElement[] | undefined): string | null {
    if (!elements || elements.length === 0) return null;

    // Priority order for elements (same as your previous background colors)
    const priorityTypes: BoardElement['type'][] = [
        'CHECKPOINT',
        'STARTING_POINT',
        'PIT',
        'PRIORITY_ANTENNA',
        'REBOOT_POINT',
        'LASER_EMITTER',
        'ENERGY_SPACE',
    ];

    for (const type of priorityTypes) {
        if (elements.some((el) => el.type === type)) {
            return `/${type.toLowerCase()}.png`;
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
        return belt.beltType === 'BLUE' ? '/conveyor_belt_blue_straight.png' : '/conveyor_belt_green_straight.png';
    }

    return null;
}

// Helper to determine rotation classes based on directional elements
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
