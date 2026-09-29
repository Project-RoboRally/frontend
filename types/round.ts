import type { GamePhase } from '@/types/gamePhase';
import type { ProgrammingTimer } from '@/types/programmingTimer';

/**
 * Represents the current round of a game, including its phase,
 * register number and programming timer.
 *
 * @author Matthias
 */

export type Round = {
  currentPhase: GamePhase;
  currentRegisterNumber: 1 | 2 | 3 | 4 | 5 | null; // Remove null if we can ensure on backend we always have 1-5
  programmingTimer: ProgrammingTimer;
};
