import { cardFromInstruction, REGISTER_COUNT } from '@/lib/programCards';
import type { Board, BoardRobot } from '@/types/board';
import type { ProgrammingCard } from '@/types/cards';
import type { GameState } from '@/types/gameState';
import type { PlayerColor } from '@/types/lobby';
import type { Player } from '@/types/player';
import type { GamePlayer, PlayerGameState } from '@/types/playerGameState';
import type { PlayerPresence } from '@/types/presence';
import type { Register } from '@/types/register';
import type { Robot, RobotModel, RobotPosition } from '@/types/robot';

/**
 * Maps websocket state onto the Player objects and registers the HUD shows.
 *
 * @author Caroline, Katarina, Kerem, Elias
 */

export function robotModelFromColor(color: PlayerColor | undefined): RobotModel {
  return color ? (`${color.toLowerCase()}Robot` as RobotModel) : 'orangeRobot';
}

/** Builds the five registers, asking cardAt for the card (if any) in each slot. */
function buildRegisters(cardAt: (index: number) => ProgrammingCard | null): Register[] {
  return Array.from({ length: REGISTER_COUNT }, (_, index) => ({
    registerNumber: (index + 1) as Register['registerNumber'],
    registerRevealed: true,
    registerCard: cardAt(index),
  }));
}

function registersFromPlayed(board: Board | null, username: string): Register[] {
  return buildRegisters((index) => {
    const played = board?.registers
      ?.find((register) => register.register === index)
      ?.cards.find((card) => card.username === username);

    return played ? cardFromInstruction(played.card.instruction, `${username}-${index}`) : null;
  });
}

function registersFromMat(
  matRegisters: { index: number; card: { instruction: string } | null }[] | undefined,
): Register[] {
  return buildRegisters((index) => {
    const card = matRegisters?.find((register) => register.index === index)?.card;
    return card ? cardFromInstruction(card.instruction, `mat-${index}`) : null;
  });
}

function registersFromProgram(
  program: ({ instruction: string } | null)[] | undefined,
  username: string,
): Register[] {
  return buildRegisters((index) => {
    const card = program?.[index];
    return card ? cardFromInstruction(card.instruction, `${username}-program-${index}`) : null;
  });
}

/** The robot the HUD shows for a player, read from the board and the player's game stats. */
function hudRobot(
  boardRobot: BoardRobot | undefined,
  checkpointsReached: number,
  energy: number,
): Robot {
  return {
    robotModel: robotModelFromColor(boardRobot?.color),
    position: {
      row: boardRobot?.y ?? 0,
      column: boardRobot?.x ?? 0,
      direction: (boardRobot?.orientation.toLowerCase() as RobotPosition['direction']) ?? 'north',
    },
    checkpointsCollected: checkpointsReached,
    energycubesCollected: energy,
    outOfGame: false,
    damageCount: 0,
  };
}

export function shownRegistersForYou(
  isActivationView: boolean,
  hasPlayedCards: boolean,
  board: Board | null,
  username: string,
  matRegisters: PlayerGameState['playerMat']['registers'] | undefined,
  draft: Register[],
): Register[] {
  const ownMatRegisters = registersFromMat(matRegisters);
  const ownMatFilled = ownMatRegisters.some((register) => register.registerCard !== null);
  if (isActivationView) {
    return ownMatFilled ? ownMatRegisters : registersFromPlayed(board, username);
  }
  return hasPlayedCards ? registersFromPlayed(board, username) : draft;
}

export function youAsHudPlayer(
  username: string,
  board: Board | null,
  you: GamePlayer | undefined,
  registers: Register[],
  online: boolean | undefined,
): Player {
  const robot = board?.robots?.find((r) => r.username === username);
  return {
    username,
    robot: hudRobot(robot, you?.checkpointsReached ?? 0, you?.energy ?? 0),
    register: registers,
    priorityOrder: false,
    programSubmitted: you?.programSubmitted ?? false,
    upgrades: you?.upgrades ?? [],
    online: online ?? true,
  };
}

export function othersAsHudPlayers(
  username: string,
  board: Board | null,
  players: GamePlayer[],
  isActivationView: boolean,
  presence: Record<string, PlayerPresence>,
): Player[] {
  return players
    .filter((gamePlayer) => gamePlayer.username !== username)
    .map((gamePlayer) => {
      const boardRobot = board?.robots?.find((robot) => robot.username === gamePlayer.username);
      const fromProgram = registersFromProgram(gamePlayer.program, gamePlayer.username);
      const programFilled = fromProgram.some((register) => register.registerCard !== null);
      const otherRegisters =
        isActivationView && programFilled
          ? fromProgram
          : registersFromPlayed(board, gamePlayer.username);
      return {
        username: gamePlayer.username,
        robot: hudRobot(boardRobot, gamePlayer.checkpointsReached, gamePlayer.energy),
        register: otherRegisters,
        priorityOrder: false,
        programSubmitted: gamePlayer.programSubmitted,
        upgrades: gamePlayer.upgrades,
        online: presence[gamePlayer.username]?.online ?? true,
      };
    });
}

export function hudDisplayState(
  playerState: PlayerGameState | null,
  hudPlayers: Player[],
  finished: boolean,
  you: Player,
  showingActivation: boolean,
  activeRegisterIndex: number | null,
): GameState {
  const roundNumber = playerState?.round.number ?? 0;
  const phase = playerState?.round.phase;
  const status: GameState['status'] = finished
    ? { state: 'over', winner: you }
    : { state: 'inprogress' };
  const shared = {
    round: roundNumber,
    timerOut: false,
    programmingEndsAt: playerState?.round.programmingEndsAt ?? null,
    status,
    players: hudPlayers,
  };

  if (showingActivation || phase === 'ACTIVATION') {
    return {
      ...shared,
      phase: 'activation_phase',
      activeRegister: ((activeRegisterIndex ?? playerState?.round.currentRegisterIndex ?? 0) +
        1) as 1 | 2 | 3 | 4 | 5,
    };
  }

  return {
    ...shared,
    phase: phase === 'UPGRADE' ? 'upgrade_phase' : 'programming_phase',
  };
}

export function offlineNoticeFor(
  presence: Record<string, PlayerPresence>,
  username: string,
): string | null {
  const blocking = Object.values(presence)
    .filter((entry) => entry.blocking && entry.username !== username)
    .map((entry) => entry.username);
  if (blocking.length === 0) {
    return null;
  }
  return `Waiting for ${blocking.join(', ')}, who ${
    blocking.length === 1 ? 'is' : 'are'
  } offline. Click their name to start a kick vote.`;
}
