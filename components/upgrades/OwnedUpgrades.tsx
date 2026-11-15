'use client';

import { FloatingTooltip } from '@/components/FloatingTooltip';
import { UPGRADE_INFO } from '@/lib/upgrades';
import type { UpgradeType } from '@/types/playerGameState';

/**
 * Shows installed permanent/temporary upgrades for a player.
 * @author Elias
 */

export function OwnedUpgrades({
  upgrades,
  title = 'Upgrades',
}: {
  upgrades: UpgradeType[];
  title?: string;
}) {
  return (
    <div className="text-left">
      <div className="mb-1 text-[10px] font-bold uppercase text-cobber-light">{title}</div>

      {upgrades.length === 0 ? (
        <div className="text-[10px] text-bone/50">No upgrades installed.</div>
      ) : (
        <ul className="flex flex-wrap gap-1">
          {upgrades.map((type, index) => {
            const info = UPGRADE_INFO[type];
            return (
              <li key={`${type}-${index}`}>
                <FloatingTooltip description={info.description} label={info.label} maxWidth={240}>
                  {(tip) => (
                    <button
                      type="button"
                      onMouseEnter={tip.onMouseEnter}
                      onMouseLeave={tip.onMouseLeave}
                      onFocus={tip.onFocus}
                      onBlur={tip.onBlur}
                      aria-describedby={tip['aria-describedby']}
                      className="rounded border border-steel-dark bg-iron px-1.5 py-0.5 text-[10px] font-semibold text-bone hover:border-cobber-light"
                    >
                      {info.label}
                    </button>
                  )}
                </FloatingTooltip>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
