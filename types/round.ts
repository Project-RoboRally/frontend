import type { GamePhase } from '@/types/gamePhase';
import type { ProgrammingTimer } from '@/types/programmingTimer';

/**
 * Represents the current round of a game.
 *
 * @author Matthias
 */

export type Round = {
  currentPhase: GamePhase;
  currentRegisterNumber: 1 | 2 | 3 | 4 | 5;
  programmingTimer: ProgrammingTimer;
};
