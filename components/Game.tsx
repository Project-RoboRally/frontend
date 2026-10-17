'use client';

/**
 * Renders the game board grid loaded from the backend. Robots are drawn from
 * the board snapshot. Falls back to an empty 12 x 12 grid until a board arrives.
 *
 * @author Matthias, Caroline, Katarina, Elias
 */

import Tile from './Tile';
import type { Board, BoardElement, BoardRobot } from '@/types/board';

const FALLBACK_SIZE = 12;

interface GameProps {
  board: Board | null;
}

export default function Game({ board }: GameProps) {
  // Backend coordinates: x = column, y = row counted from the top.
  const width = board?.width ?? FALLBACK_SIZE;
  const height = board?.height ?? FALLBACK_SIZE;
  const elementsAt = new Map<string, BoardElement[]>(
    (board?.spaces ?? []).map((space) => [`${space.x},${space.y}`, space.elements]),
  );
  const robotsAt = new Map<string, BoardRobot>(
    (board?.robots ?? []).map((robot) => [`${robot.x},${robot.y}`, robot]),
  );

  return (
    <section className="aspect-square w-[600px] rounded-lg border-2 border-slate-700 bg-slate-900 p-2 shadow-xl">
      <div
        className="grid h-full w-full bg-slate-800 p-1"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: width * height }).map((_, index) => {
          const x = index % width;
          const y = Math.floor(index / width);

          return (
            <Tile
              key={index}
              x={x}
              y={y}
              elements={elementsAt.get(`${x},${y}`)}
              robot={robotsAt.get(`${x},${y}`)}
            />
          );
        })}
      </div>
    </section>
  );
}
