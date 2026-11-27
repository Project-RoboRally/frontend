'use client';

/**
 * Renders the game board grid loaded from the backend. Robots are drawn over
 * the grid and step through each turn and move instead of jumping to the end,
 * and the lasers fire after each register's moves.
 *
 * @author Matthias, Caroline, Katarina, Elias
 */

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';

import { laserBeams, type LaserBeam, type LaserBeat, type Shooter } from '@/lib/lasers';
import { robotSprite } from '@/lib/playerColors';

import { labelForInstruction } from '@/lib/programCards';
import { ACTION_MS } from '@/lib/registerPlayback';
import { useRegisterPlayback } from './game/useRegisterPlayback';
import Tile from './Tile';
import type { Board, BoardElement, BoardRobot, Direction } from '@/types/board';

const FALLBACK_SIZE = 12;
const NO_LASERS: LaserBeat[] = [];
const NO_SHOOTERS: Record<string, Shooter> = {};

const STEP_DELTA: Record<Direction, [number, number]> = {
  NORTH: [0, -1],
  EAST: [1, 0],
  SOUTH: [0, 1],
  WEST: [-1, 0],
};

// Where each parallel beam runs across the tile, in percent, by damage.
const BEAM_OFFSETS: Record<number, number[]> = {
  1: [50],
  2: [32, 68],
  3: [25, 50, 75],
};

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
      className="h-4/5 w-4/5 object-contain transition-transform duration-(--frame-duration) ease-linear"
      style={{ transform: `rotate(${angle}deg)` }}
    />
  );
}

// One continuous shot: from the tile it leaves (the robot or the emitter)
// through the last tile it reaches.
type LaserShot = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  direction: Direction;
  lines: number;
};

function shotsOf(beams: LaserBeam[]): LaserShot[] {
  const shots: LaserShot[] = [];
  for (const beam of beams) {
    const [dx, dy] = STEP_DELTA[beam.direction];
    const previous = shots.at(-1);
    const continues =
      previous !== undefined &&
      previous.direction === beam.direction &&
      previous.lines === beam.lines &&
      previous.toX + dx === beam.x &&
      previous.toY + dy === beam.y;
    if (continues && previous) {
      previous.toX = beam.x;
      previous.toY = beam.y;
    } else {
      shots.push({
        fromX: beam.x - dx,
        fromY: beam.y - dy,
        toX: beam.x,
        toY: beam.y,
        direction: beam.direction,
        lines: beam.lines,
      });
    }
  }
  return shots;
}

function LaserShotLine({
  shot,
  width,
  height,
}: {
  shot: LaserShot;
  width: number;
  height: number;
}) {
  const vertical = shot.direction === 'NORTH' || shot.direction === 'SOUTH';
  const x0 = ((shot.fromX + 0.5) / width) * 100;
  const y0 = ((shot.fromY + 0.5) / height) * 100;
  const x1 = ((shot.toX + 0.5) / width) * 100;
  const y1 = ((shot.toY + 0.5) / height) * 100;
  const cell = vertical ? 100 / width : 100 / height;
  const thickness = cell * 0.14;
  return (
    <>
      {(BEAM_OFFSETS[shot.lines] ?? BEAM_OFFSETS[1]).map((offset) => {
        const shift = ((offset - 50) / 100) * cell;
        return (
          <span
            key={offset}
            className="absolute rounded-full bg-[#ff2a14] shadow-[0_0_10px_3px_rgba(255,40,20,0.9)]"
            style={{
              left: vertical ? `${(x0 + x1) / 2 + shift - thickness / 2}%` : `${Math.min(x0, x1)}%`,
              top: vertical ? `${Math.min(y0, y1)}%` : `${(y0 + y1) / 2 + shift - thickness / 2}%`,
              width: vertical ? `${thickness}%` : `${Math.abs(x1 - x0)}%`,
              height: vertical ? `${Math.abs(y1 - y0)}%` : `${thickness}%`,
            }}
          />
        );
      })}
    </>
  );
}

interface GameProps {
  board: Board | null;
  // When each register's lasers fire, relative to board.steps.
  laserBeats?: LaserBeat[];
  shooters?: Record<string, Shooter>;
  onAnimationComplete?: (board: Board) => void;
  onStepIndexChange?: (index: number | null, register?: number | null) => void;
}

export default function Game({
  board,
  laserBeats = NO_LASERS,
  shooters = NO_SHOOTERS,
  onAnimationComplete,
  onStepIndexChange,
}: GameProps) {
  // Backend coordinates: x = column, y = row counted from the top.
  const width = board?.width ?? FALLBACK_SIZE;
  const height = board?.height ?? FALLBACK_SIZE;
  const elementsAt = new Map<string, BoardElement[]>(
    (board?.spaces ?? []).map((space) => [`${space.x},${space.y}`, space.elements]),
  );

  const {
    robots,
    frame,
    index: frameIndex,
  } = useRegisterPlayback(board, laserBeats, onAnimationComplete, onStepIndexChange);
  const beams = frame?.laser && board ? laserBeams(board.spaces, robots, shooters) : [];
  const shots = shotsOf(beams);
  const hitTiles = new Set(beams.filter((beam) => beam.hit).map((beam) => `${beam.x},${beam.y}`));

  return (
    <div
      className="relative flex h-full w-full items-center justify-center [container-type:size]"
      style={
        {
          '--frame-duration': `${frame?.duration ?? 0}ms`,
          '--action-duration': `${ACTION_MS}ms`,
        } as CSSProperties
      }
    >
      {frame?.card && (
        <span className="pointer-events-none absolute top-1 z-30 rounded bg-charcoal px-2 py-1 text-sm text-bone">
          {frame.card.username} ·{' '}
          {labelForInstruction(frame.card.card.instruction ?? frame.card.card.type)}
        </span>
      )}
      <section
        className="box-content shadow-[0_12px_30px_10px_rgba(0,0,0,0.9)]"
        style={{
          // Reserve 20px for the frame (padding + border) on each axis.
          width: `max(0px, min(100cqw - 20px, (100cqh - 20px) * ${width / height}))`,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <div
          className="relative grid h-full w-full bg-slate-900"
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

          {frame?.laser && shots.length > 0 ? (
            <div
              key={frameIndex}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 animate-[laser-fire_var(--action-duration)_ease-out_both]"
            >
              {shots.map((shot, index) => (
                <LaserShotLine key={index} shot={shot} width={width} height={height} />
              ))}
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 z-20">
            {robots.map((robot) => (
              <div
                key={robot.username}
                className="absolute flex items-center justify-center rounded-full transition-[left,top] duration-(--frame-duration) ease-linear"
                style={{
                  left: `${(robot.x / width) * 100}%`,
                  top: `${(robot.y / height) * 100}%`,
                  width: `${100 / width}%`,
                  height: `${100 / height}%`,
                }}
              >
                {hitTiles.has(`${robot.x},${robot.y}`) && (
                  <span
                    key={frameIndex}
                    aria-hidden
                    className="absolute inset-0 rounded-full animate-[robot-hit_var(--action-duration)_ease-out_both]"
                  />
                )}
                {frame?.card?.stepCount === 0 && frame.card.username === robot.username && (
                  <span
                    key={frameIndex}
                    aria-hidden
                    className="absolute inset-1 rounded-full border-2 border-amber animate-[ping_var(--action-duration)_ease-out_both] motion-reduce:animate-none"
                  />
                )}
                <RobotSprite robot={robot} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
