import { describe, expect, it } from 'vitest';

import { laserBeams, laserBeats, lastFiredRegister } from './lasers';
import type { BoardElement, BoardRegister, BoardRobot, BoardSpace } from '@/types/board';

// A 5 wide, 1 tall board with extra elements on some tiles.
function row(extra: Record<number, BoardElement[]> = {}): BoardSpace[] {
  return Array.from({ length: 5 }, (_, x) => ({ x, y: 0, elements: extra[x] ?? [] }));
}

function robot(username: string, x: number, orientation: BoardRobot['orientation']): BoardRobot {
  return { username, color: 'RED', x, y: 0, orientation } as BoardRobot;
}

const tiles = (beams: ReturnType<typeof laserBeams>) =>
  beams.map((beam) => [beam.x, beam.hit]);

describe('laserBeams', () => {
  it('stops a robot laser on the first robot it hits', () => {
    const robots = [robot('ada', 0, 'EAST'), robot('bob', 2, 'NORTH'), robot('cy', 3, 'NORTH')];
    expect(tiles(laserBeams(row(), robots, {}))).toEqual([
      [1, false],
      [2, true],
    ]);
  });

  it('stops at a wall on either side of the border', () => {
    const robots = [robot('ada', 0, 'EAST')];
    const wallAhead = row({ 2: [{ type: 'WALL', side: 'WEST' }] });
    expect(tiles(laserBeams(wallAhead, robots, {}))).toEqual([[1, false]]);
  });

  it('does not enter the priority antenna', () => {
    const robots = [robot('ada', 0, 'EAST')];
    const antenna = row({ 3: [{ type: 'PRIORITY_ANTENNA' }] });
    expect(tiles(laserBeams(antenna, robots, {}))).toEqual([
      [1, false],
      [2, false],
    ]);
  });

  it('hits a robot standing on a board laser emitter', () => {
    const spaces = row({ 0: [{ type: 'LASER_EMITTER', direction: 'EAST', damage: 2 }] });
    const beams = laserBeams(spaces, [robot('ada', 0, 'NORTH')], {});
    expect(beams).toEqual([{ x: 0, y: 0, direction: 'EAST', lines: 2, hit: true }]);
  });

  it('runs a board laser to the edge when nothing is in the way', () => {
    const spaces = row({ 1: [{ type: 'LASER_EMITTER', direction: 'EAST', damage: 1 }] });
    expect(tiles(laserBeams(spaces, [], {}))).toEqual([
      [2, false],
      [3, false],
      [4, false],
    ]);
  });

  it('shoots backwards too with a Rear Laser', () => {
    const robots = [robot('ada', 2, 'EAST')];
    const beams = laserBeams(row(), robots, { ada: { upgrades: ['REAR_LASER'], rebooted: false } });
    expect(beams.map((beam) => [beam.x, beam.direction])).toEqual([
      [3, 'EAST'],
      [4, 'EAST'],
      [1, 'WEST'],
      [0, 'WEST'],
    ]);
  });

  it('shoots through walls and robots with a Rail Gun', () => {
    const robots = [robot('ada', 0, 'EAST'), robot('bob', 1, 'NORTH')];
    const spaces = row({ 2: [{ type: 'WALL', side: 'WEST' }] });
    const beams = laserBeams(spaces, robots, {
      ada: { upgrades: ['RAIL_GUN', 'DOUBLE_BARREL_LASER'], rebooted: false },
      bob: { upgrades: [], rebooted: true },
    });
    expect(beams.map((beam) => [beam.x, beam.hit, beam.lines])).toEqual([
      [1, true, 2],
      [2, false, 2],
      [3, false, 2],
      [4, false, 2],
    ]);
  });
});

const card = (firstStep: number) => ({
  username: 'ada',
  card: { type: 'PROGRAMMING', instruction: 'MOVE_1' },
  firstStep,
  stepCount: 1,
});

const registers: BoardRegister[] = [
  { register: 0, cards: [card(0)] },
  { register: 1, cards: [card(2)] },
  { register: 2, cards: [card(3)] },
];

describe('lastFiredRegister', () => {
  it('counts every register once the round is over', () => {
    expect(lastFiredRegister(null, null, registers)).toBe(2);
    expect(lastFiredRegister(null, null, [])).toBe(-1);
  });

  it('only counts the paused register when it waits on a weapon pick', () => {
    expect(lastFiredRegister(2, 'MOVE_ONE', registers)).toBe(1);
    expect(lastFiredRegister(2, 'WEAPON_UPGRADE', registers)).toBe(2);
  });
});

describe('laserBeats', () => {
  it('fires each register before the next register starts moving', () => {
    expect(laserBeats(registers, 4, -1, 2)).toEqual([
      { register: 0, afterStep: 2 },
      { register: 1, afterStep: 3 },
      { register: 2, afterStep: 4 },
    ]);
  });

  it('skips registers that already fired in an earlier message', () => {
    expect(laserBeats(registers, 4, 0, 1)).toEqual([{ register: 1, afterStep: 3 }]);
  });
});
