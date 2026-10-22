import type { BoardElement, Direction } from '@/types/board';
import { getElementColor, getElementImage, getElementRotation } from '@/types/boardElements';

/**
 * Renders a game board cell at coordinates (x, y). The background color shows
 * which board element is on the space, and walls are drawn as a thick border
 * on their side. Robots are drawn over the grid so they can move between cells.
 *
 * @author Matthias, Caroline, Katarina, Elias
 */

interface TileProps {
  x: number;
  y: number;
  // Undefined when the space is not part of the loaded board.
  elements: BoardElement[] | undefined;
}

const EMPTY_SPACE_COLOR = '#303c4c';
const MISSING_SPACE_COLOR = '#020617';
const WALL_COLOR = '#facc15';

const BORDER_SIDE: Record<Direction, 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'> =
  {
    NORTH: 'borderTop',
    EAST: 'borderRight',
    SOUTH: 'borderBottom',
    WEST: 'borderLeft',
  };

export default function Tile({ x, y, elements }: TileProps) {
  const wallBorders = Object.fromEntries(
    (elements ?? []).flatMap((element) =>
      element.type === 'WALL' ? [[BORDER_SIDE[element.side], `4px solid ${WALL_COLOR}`]] : [],
    ),
  );

  const label = elements?.map((element) => element.type).join(', ') || 'EMPTY';
  const imageSrc = getElementImage(elements);
  const rotationClass = getElementRotation(elements);

  // Placeholder color for elements without images.
  const placeholderColor = getElementColor(elements);

  return (
    <div
      aria-label={`Tile ${x}, ${y}: ${label}`}
      title={`(${x}, ${y}) ${label}`}
      style={{
        backgroundColor: imageSrc
          ? EMPTY_SPACE_COLOR
          : (placeholderColor ?? (elements ? EMPTY_SPACE_COLOR : MISSING_SPACE_COLOR)),
        ...wallBorders,
      }}
      className="relative flex h-full w-full items-center justify-center border border-slate-700 overflow-hidden"
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={label}
          className={`h-full w-full object-contain pointer-events-none transition-transform ${rotationClass}`}
        />
      )}
    </div>
  );
}
