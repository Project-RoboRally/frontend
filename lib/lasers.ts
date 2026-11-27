import type { BoardElement, BoardRegister, BoardRobot, BoardSpace, Direction } from '@/types/board';
import type { UpgradeType } from '@/types/playerGameState';

/**
 * Where lasers fire during the activation animation, following the backend's
 * rules: a beam stops at the first robot, a wall, the priority antenna or the
 * edge of the board. A Rail Gun shoots through walls and robots.
 *
 * @author Elias
 */

/** One tile a beam passes through. hit is true when a robot stands on it. */
export type LaserBeam = {
  x: number;
  y: number;
  direction: Direction;
  lines: number;
  hit: boolean;
};

/** Fire a register's lasers once afterStep animation frames have played. */
export type LaserBeat = {
  register: number;
  afterStep: number;
};

/** What a robot shoots with. Rebooted robots do not shoot. */
export type Shooter = {
  upgrades: UpgradeType[];
  rebooted: boolean;
};

const STEP: Record<Direction, [number, number]> = {
  NORTH: [0, -1],
  EAST: [1, 0],
  SOUTH: [0, 1],
  WEST: [-1, 0],
};

const OPPOSITE: Record<Direction, Direction> = {
  NORTH: 'SOUTH',
  EAST: 'WEST',
  SOUTH: 'NORTH',
  WEST: 'EAST',
};

const key = (x: number, y: number) => `${x},${y}`;

/**
 * The highest register whose lasers have fired, given the round in the
 * message. A paused register has only fired if it waits on a weapon pick.
 */
export function lastFiredRegister(
  currentRegisterIndex: number | null,
  choiceType: string | null,
  registers: BoardRegister[] | undefined,
): number {
  if (currentRegisterIndex == null) {
    return Math.max(-1, ...(registers ?? []).map((register) => register.register));
  }
  return choiceType === 'WEAPON_UPGRADE' ? currentRegisterIndex : currentRegisterIndex - 1;
}

/**
 * When to fire the lasers of each register after `firedBefore` up to and
 * including `firedUpTo`. A register fires after its own moves, so right before
 * the first frame of the next register's cards, or at the end.
 */
export function laserBeats(
  registers: BoardRegister[] | undefined,
  stepCount: number,
  firedBefore: number,
  firedUpTo: number,
): LaserBeat[] {
  const beats: LaserBeat[] = [];
  for (let register = firedBefore + 1; register <= firedUpTo; register++) {
    const next = registers?.find((played) => played.register === register + 1);
    const nextStart = next?.cards.length
      ? Math.min(...next.cards.map((card) => card.firstStep))
      : stepCount;
    beats.push({ register, afterStep: Math.min(Math.max(nextStart, 0), stepCount) });
  }
  return beats;
}

function hasWall(elements: BoardElement[] | undefined, side: Direction) {
  return (elements ?? []).some(
    (element) =>
      (element.type === 'WALL' && element.side === side) ||
      // Push panels and emitters sit on the wall behind them
      (element.type === 'PUSH_PANEL' && OPPOSITE[element.pushDirection] === side) ||
      (element.type === 'LASER_EMITTER' && OPPOSITE[element.direction] === side),
  );
}

/**
 * Every beam fired with the robots standing as in `robots`: the board's
 * emitters, then each robot's forward shot and Rear Laser.
 */
export function laserBeams(
  spaces: BoardSpace[],
  robots: BoardRobot[],
  shooters: Record<string, Shooter>,
): LaserBeam[] {
  const elementsAt = new Map(spaces.map((space) => [key(space.x, space.y), space.elements]));
  const robotAt = new Set(robots.map((robot) => key(robot.x, robot.y)));

  const trace = (x: number, y: number, direction: Direction, lines: number, rail: boolean) => {
    const beams: LaserBeam[] = [];
    const [dx, dy] = STEP[direction];
    while (true) {
      const nextX = x + dx;
      const nextY = y + dy;
      const next = elementsAt.get(key(nextX, nextY));
      if (
        next === undefined ||
        next.some((element) => element.type === 'PRIORITY_ANTENNA') ||
        (!rail &&
          (hasWall(elementsAt.get(key(x, y)), direction) || hasWall(next, OPPOSITE[direction])))
      ) {
        return beams;
      }
      const hit = robotAt.has(key(nextX, nextY));
      beams.push({ x: nextX, y: nextY, direction, lines, hit });
      if (hit && !rail) {
        return beams;
      }
      x = nextX;
      y = nextY;
    }
  };

  const beams: LaserBeam[] = [];
  for (const space of spaces) {
    for (const element of space.elements) {
      if (element.type !== 'LASER_EMITTER') continue;
      const lines = Math.min(3, Math.max(1, element.damage));
      if (robotAt.has(key(space.x, space.y))) {
        beams.push({ x: space.x, y: space.y, direction: element.direction, lines, hit: true });
      } else {
        beams.push(...trace(space.x, space.y, element.direction, lines, false));
      }
    }
  }

  for (const robot of robots) {
    const shooter = shooters[robot.username];
    if (shooter?.rebooted) continue;
    const upgrades = shooter?.upgrades ?? [];
    const lines = upgrades.includes('DOUBLE_BARREL_LASER') ? 2 : 1;
    beams.push(...trace(robot.x, robot.y, robot.orientation, lines, upgrades.includes('RAIL_GUN')));
    if (upgrades.includes('REAR_LASER')) {
      beams.push(...trace(robot.x, robot.y, OPPOSITE[robot.orientation], lines, false));
    }
  }
  return beams;
}
