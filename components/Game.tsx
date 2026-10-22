'use client';

/**
 * Renders the game board grid loaded from the backend. Robots are drawn over
 * the grid and step through each turn and move instead of jumping to the end.
 *
 * @author Matthias, Caroline, Katarina, Elias
 */

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { robotSprite } from '@/lib/playerColors';

import Tile from './Tile';
import type { Board, BoardElement, BoardRobot, Direction } from '@/types/board';

const FALLBACK_SIZE = 12;
const STEP_MS = 420;

// Artwork faces north. CSS rotation is clockwise.
const FACING: Record<Direction, string> = {
  NORTH: 'rotate(0deg)',
  EAST: 'rotate(90deg)',
  SOUTH: 'rotate(180deg)',
  WEST: 'rotate(270deg)',
};

function useAnimatedRobots(board: Board | null) {
  const [robots, setRobots] = useState<BoardRobot[]>(board?.robots ?? []);

  useEffect(() => {
    if (!board) {
      return;
    }

    const frames = board.steps ?? [];
    if (frames.length === 0) {
      setRobots(board.robots ?? []);
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      if (index >= frames.length) {
        setRobots(board.robots ?? []);
        window.clearInterval(timer);
        return;
      }
      setRobots(frames[index]);
      index += 1;
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [board]);

  return robots;
}

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
  const robots = useAnimatedRobots(board);

  return (
    <section className="aspect-square w-[600px] rounded-lg border-2 border-slate-900 bg-slate-900 p-2 shadow-xl">
      <div
        className="relative grid h-full w-full bg-slate-900 p-1"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: width * height }).map((_, index) => {
          const x = index % width;
          const y = Math.floor(index / width);

          return <Tile key={index} x={x} y={y} elements={elementsAt.get(`${x},${y}`)} />;
        })}

        <div className="pointer-events-none absolute inset-1">
          {robots.map((robot) => (
            <div
              key={robot.username}
              className="absolute flex items-center justify-center transition-[left,top] duration-300 ease-linear"
              style={{
                left: `${(robot.x / width) * 100}%`,
                top: `${(robot.y / height) * 100}%`,
                width: `${100 / width}%`,
                height: `${100 / height}%`,
              }}
            >
              <Image
                src={robotSprite(robot.color)}
                alt={`${robot.username}'s robot`}
                width={40}
                height={40}
                className="h-4/5 w-4/5 object-contain transition-transform duration-300 ease-linear"
                style={{ transform: FACING[robot.orientation] }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
