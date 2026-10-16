import Image from 'next/image';

import type { BoardElement, Direction } from '@/types/board';

/**
 * Renders interactive game board tile at coordinates (x,y). The background
 * color shows which board element is on the space, walls are drawn as a thick
 * border on their side, and the tile can display the orange robot.
 *
 * @author Matthias, Caroline, Katarina, Elias
 */

interface TileProps {
  x: number;
  y: number;
  // Undefined when the space is not part of the loaded board.
  elements: BoardElement[] | undefined;
  hasRobot: boolean;
  onClick: () => void;
}

const EMPTY_SPACE_COLOR = '#334155';
const MISSING_SPACE_COLOR = '#020617';
const WALL_COLOR = '#facc15';

// Earlier entries win when a space holds several elements.
const ELEMENT_COLORS: [BoardElement['type'], string][] = [
  ['CHECKPOINT', '#16a34a'],
  ['STARTING_POINT', '#f8fafc'],
  ['PIT', '#000000'],
  ['PRIORITY_ANTENNA', '#a855f7'],
  ['REBOOT_POINT', '#06b6d4'],
  ['LASER_EMITTER', '#dc2626'],
  ['GEAR', '#ea580c'],
  ['PUSH_PANEL', '#a16207'],
  ['ENERGY_SPACE', '#eab308'],
];

const BORDER_SIDE: Record<Direction, 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'> =
  {
    NORTH: 'borderTop',
    EAST: 'borderRight',
    SOUTH: 'borderBottom',
    WEST: 'borderLeft',
  };

function backgroundColor(elements: BoardElement[] | undefined) {
  if (!elements) {
    return MISSING_SPACE_COLOR;
  }

  for (const [type, color] of ELEMENT_COLORS) {
    if (elements.some((element) => element.type === type)) {
      return color;
    }
  }

  const belt = elements.find((element) => element.type === 'CONVEYOR_BELT');
  if (belt) {
    return belt.beltType === 'BLUE' ? '#2563eb' : '#22c55e';
  }

  return EMPTY_SPACE_COLOR;
}

export default function Tile({ x, y, elements, hasRobot, onClick }: TileProps) {
  const wallBorders = Object.fromEntries(
    (elements ?? []).flatMap((element) =>
      element.type === 'WALL' ? [[BORDER_SIDE[element.side], `4px solid ${WALL_COLOR}`]] : [],
    ),
  );
  const label = elements?.map((element) => element.type).join(', ') || 'EMPTY';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Tile ${x}, ${y}: ${label}`}
      title={`(${x}, ${y}) ${label}`}
      style={{ backgroundColor: backgroundColor(elements), ...wallBorders }}
      className="relative flex h-full w-full items-center justify-center border border-slate-700 text-xs text-slate-400 transition-opacity hover:opacity-75"
    >
      {hasRobot && (
        <div className="relative z-10 flex h-4/5 w-4/5 items-center justify-center">
          <Image
            src="/orange_Robot.png"
            alt="Orange Robot"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      )}
    </button>
  );
}
