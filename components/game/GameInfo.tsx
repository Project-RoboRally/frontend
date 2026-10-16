import type { Game } from '@/types/game';

/**
 * Displays information about the current game.
 *
 * @author Matthias
 */
export function GameInfo({ game }: { game: Game }) {
  return (
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3 text-left">
      <div className="mb-2 text-[10px] font-bold uppercase text-cobber-light">Game</div>

      <div className="space-y-1 text-sm text-bone">
        <p>Status: {game.status}</p>
        <p>Phase: {game.currentRound.currentPhase}</p>
        <p>Register: {game.currentRound.currentRegisterNumber}</p>
      </div>
    </div>
  );
}
