'use client';

import { UPGRADE_INFO } from '@/lib/upgrades';
import { PROGRAMMING_UPGRADES } from '@/lib/upgrades/programming';
import type { Card, UpgradeType } from '@/types/playerGameState';
import { CacheMemoryFlow } from '@/components/upgrades/use/CacheMemoryFlow';
import { DefragGizmoFlow } from '@/components/upgrades/use/DefragGizmoFlow';
import { InstantUseFlow } from '@/components/upgrades/use/InstantUseFlow';
import { MemorySwapFlow } from '@/components/upgrades/use/MemorySwapFlow';

/**
 * Programming-phase bar: use installed upgrades that call POST /upgrade/use.
 * @author Elias
 */

export function ProgrammingUpgradeBar({
  gameId,
  owned,
  hand,
  cardsToPutBack,
  usedThisRound = [],
  disabled,
  onError,
}: {
  gameId: string;
  owned: UpgradeType[];
  hand: Card[];
  cardsToPutBack: number;
  usedThisRound?: UpgradeType[];
  disabled: boolean;
  onError: (message: string) => void;
}) {
  const usable = PROGRAMMING_UPGRADES.filter(
    (spec) => owned.includes(spec.type) && !usedThisRound.includes(spec.type),
  );
  const spent = PROGRAMMING_UPGRADES.filter(
    (spec) => owned.includes(spec.type) && usedThisRound.includes(spec.type),
  );

  if (usable.length === 0 && spent.length === 0 && cardsToPutBack <= 0) {
    return null;
  }

  const mustPutBack = cardsToPutBack > 0;

  return (
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3 text-left">
      <div className="mb-2 text-[10px] font-bold uppercase text-cobber-light">
        {mustPutBack ? 'Memory Swap - put back' : 'Use upgrades'}
      </div>

      {mustPutBack ? (
        <MemorySwapFlow
          mode="put-back"
          cardsToPutBack={cardsToPutBack}
          disabled={disabled}
          gameId={gameId}
          hand={hand}
          onDone={() => undefined}
          onError={onError}
          upgrade="MEMORY_SWAP"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {usable.map((spec) => {
            const label = UPGRADE_INFO[spec.type].label;
            const props = {
              disabled,
              gameId,
              hand,
              onDone: () => undefined,
              onError,
              upgrade: spec.type,
            };
            if (spec.type === 'CACHE_MEMORY') {
              return <CacheMemoryFlow key={spec.type} {...props} />;
            }
            if (spec.type === 'DEFRAG_GIZMO') {
              return <DefragGizmoFlow key={spec.type} {...props} />;
            }
            if (spec.type === 'MEMORY_SWAP') {
              return <MemorySwapFlow key={spec.type} {...props} cardsToPutBack={0} mode="use" />;
            }
            return <InstantUseFlow key={spec.type} label={label} {...props} />;
          })}
          {spent.map((spec) => (
            <div
              key={`used-${spec.type}`}
              className="rounded-md border border-steel-dark/70 bg-iron/40 px-2 py-1.5 text-[11px] font-semibold text-bone/45"
            >
              {UPGRADE_INFO[spec.type].label} - used this round
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
