import { GameState } from '@/types/gameState';

/**
 * Displays the state of the games in the lobby bar hub (Waiting, active, unactive)
 * 
 * @author Kerem, Matthias
 */

export function LobbyStatus({ gameState }: { gameState: GameState }) {
  return (
    <div>
      {gameState.status.state === "waiting" ? (
        <p>Waiting for players! ({gameState.players.length}/6)</p>
      ) : (
        <p>{gameState.status.state}</p>
      )}
    </div>
  );
}