import type { GamePhase } from '@/types/gamePhase';
import type { GameStatus } from '@/types/gameStatus';

export type GameDTO = {
  gameId: string;
  status: GameStatus;
  roundNumber: number;
  currentPhase: GamePhase;
  currentRegister: number | null;
};
