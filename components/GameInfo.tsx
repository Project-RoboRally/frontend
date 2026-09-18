import { GameState } from '@/types/state';

export function GameInfo({gameState}: {gameState: GameState}) {
  return (
    <div>
      <p>Round: {gameState.round} </p>
      <p>Phase: {gameState.phase} </p>
    </div>
  )
}