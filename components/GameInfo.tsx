import { GameState } from '@/types/gameState';

export function GameInfo({gameState}: {gameState: GameState}) {
  return (
    <div>
      <p>Round: {gameState.round} </p>
      <p>Phase: {gameState.phase} </p>
    </div>
  )
}