/**
 * Type definition for the game (Gameboard scene)
 * 
 * @author Kerem
 */

import type { GameStatus } from "@/types/gameStatus";
import type { Round } from "@/types/round";
import type { Player } from "@/types/player";

export type Game = {
  id: string;
  name: string;
  players: Player[];
  status: GameStatus;
  currentRound: Round;
};