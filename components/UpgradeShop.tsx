'use client';

import { useState } from 'react';
import { FloatingTooltip } from '@/components/FloatingTooltip';
import {
  needsReplace,
  ReplaceUpgradePicker,
} from '@/components/upgrades/shop/ReplaceUpgradePicker';
import { secondaryButtonClassName } from '@/lib/styles';
import { UPGRADE_INFO } from '@/lib/upgrades';
import type { Upgrade, UpgradeType } from '@/types/playerGameState';

/**
 * Lets the current buyer pick an upgrade or skip the shop.
 *
 * @author Elias
 */

export function UpgradeShop({
  shop,
  currentBuyer,
  username,
  energy,
  owned,
  disabled,
  onBuy,
  onSkip,
}: {
  shop: Upgrade[];
  currentBuyer: string | null;
  username: string;
  energy: number;
  owned: UpgradeType[];
  disabled: boolean;
  onBuy: (upgrade: UpgradeType, replace?: UpgradeType | null) => void;
  onSkip: () => void;
}) {
  const isBuyer = currentBuyer === username;
  const [pending, setPending] = useState<Upgrade | null>(null);

  function handlePick(upgrade: Upgrade) {
    if (needsReplace(upgrade, owned)) {
      setPending(upgrade);
      return;
    }
    onBuy(upgrade.type, null);
  }

  if (pending) {
    return (
      <ReplaceUpgradePicker
        buying={pending}
        disabled={disabled}
        owned={owned}
        onCancel={() => setPending(null)}
        onConfirm={(replace) => {
          onBuy(pending.type, replace);
          setPending(null);
        }}
      />
    );
  }

  return (
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3 text-left">
      <div className="mb-2 text-[10px] font-bold uppercase text-cobber-light">Upgrade Shop</div>

      <p className="mb-3 text-xs text-bone/80">
        {isBuyer
          ? 'Your turn to buy.'
          : currentBuyer
            ? `Waiting for ${currentBuyer}.`
            : 'The shop is closed.'}
      </p>

      <div className="flex flex-wrap gap-2">
        {shop.length === 0 ? (
          <span className="text-xs text-bone/60">No upgrades left this round.</span>
        ) : (
          shop.map((upgrade, index) => {
            const canAfford = energy >= upgrade.cost;
            const info = UPGRADE_INFO[upgrade.type];
            const buttonDisabled = disabled || !isBuyer || !canAfford;

            return (
              <FloatingTooltip
                key={`${upgrade.type}-${index}`}
                disabled={buttonDisabled}
                description={info.description}
                label={info.label}
              >
                {(tip) => (
                  <button
                    type="button"
                    disabled={buttonDisabled}
                    onClick={() => handlePick(upgrade)}
                    onMouseEnter={tip.onMouseEnter}
                    onMouseLeave={tip.onMouseLeave}
                    onFocus={tip.onFocus}
                    onBlur={tip.onBlur}
                    aria-describedby={tip['aria-describedby']}
                    className="flex min-w-20 flex-col items-center rounded-md border-2 border-steel-dark bg-iron px-2 py-2 text-xs font-bold text-bone transition hover:border-cobber-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{info.label}</span>
                    <span className="mt-1 text-[10px] uppercase text-cobber-light">
                      {upgrade.cost} energy
                    </span>
                  </button>
                )}
              </FloatingTooltip>
            );
          })
        )}
      </div>

      {isBuyer ? (
        <button
          type="button"
          className={`${secondaryButtonClassName} mt-3 w-full text-sm`}
          disabled={disabled}
          onClick={onSkip}
        >
          Skip
        </button>
      ) : null}
    </div>
  );
}
