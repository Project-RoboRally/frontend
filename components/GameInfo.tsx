import { GameState } from '@/types/gameState';

export function GameInfo({gameState}: {gameState: GameState}) {
  return (
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3">
      <div className="mb-3 text-[10px] font-bold uppercase text-cobber-light">
        Game Status
      </div>

      <div className="flex items-baseline justify-between border-b border-steel-dark pb-2">
        <span className="text-xs uppercase tracking-wider text-bone/60">
          Round
        </span>

        <span className="text-xl font-bold text-bone">
          {gameState.round}
        </span>
      </div>

      <div className="pt-2">
        <div className="text-xs uppercase tracking-wider text-bone/60">
          Phase
        </div>

        <div className="mt-1 break-words font-bold uppercase text-verdigris">
          {gameState.phase}
        </div>
      </div>
    </div>
  );
}