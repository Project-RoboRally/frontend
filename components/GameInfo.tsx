import { GameState } from '@/types/gameState';

/**
 * Displays several aspects the games status in the gameboard scene
 *
 * @author Kerem, Matthias, Katarina
 */

const PHASE_LABEL: Record<GameState['phase'], string> = {
  upgrade_phase: 'Upgrade',
  programming_phase: 'Programming',
  activation_phase: 'Activation',
};

export function GameInfo({ gameState }: { gameState: GameState }) {
  const phaseLabel =
    gameState.phase === 'activation_phase'
      ? `${PHASE_LABEL.activation_phase} · Register ${gameState.activeRegister}`
      : PHASE_LABEL[gameState.phase];

  return (
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3">
      <div className="mb-3 text-[10px] font-bold uppercase text-cobber-light">Game Status</div>

      <div className="flex items-baseline justify-between border-b border-steel-dark pb-2">
        <span className="text-xs uppercase tracking-wider text-bone/60">Round</span>

        <span className="text-xl font-bold text-bone">{gameState.round}</span>
      </div>

      <div className="flex items-baseline justify-between pt-2">

        <span className="text-xs uppercase tracking-wider text-bone/60">Phase</span>

        <span className="mt-1 break-words font-bold uppercase text-verdigris">{phaseLabel}</span>
      </div>
    </div>
  );
}
