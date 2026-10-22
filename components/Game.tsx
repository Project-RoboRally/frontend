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
const FACING: Record<Direction, number> = {
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
  WEST: 270,
};

// Signed turn in (-180, 180] from the current angle to the target facing,
// so WEST -> NORTH animates +90 instead of -270.
function shortestTurn(angle: number, target: Direction) {
  const delta = (((FACING[target] - angle) % 360) + 360) % 360;
  return delta > 180 ? delta - 360 : delta;
}

// Keeps an unbounded angle per robot (e.g. 360, -90) so CSS always
// transitions the short way round.
function RobotSprite({ robot }: { robot: BoardRobot }) {
  const [orientation, setOrientation] = useState(robot.orientation);
  const [angle, setAngle] = useState(FACING[robot.orientation]);

  if (robot.orientation !== orientation) {
    setOrientation(robot.orientation);
    setAngle(angle + shortestTurn(angle, robot.orientation));
  }

  return (
    <Image
      src={robotSprite(robot.color)}
      alt={`${robot.username}'s robot`}
      width={40}
      height={40}
      className="h-4/5 w-4/5 object-contain transition-transform duration-300 ease-linear"
      style={{ transform: `rotate(${angle}deg)` }}
    />
  );
}

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
              <RobotSprite robot={robot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
