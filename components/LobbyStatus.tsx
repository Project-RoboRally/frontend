import { GameState } from '@/types/state';

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