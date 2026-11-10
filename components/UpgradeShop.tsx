import { secondaryButtonClassName } from '@/lib/styles';
import { labelForInstruction } from '@/lib/programCards';
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
  disabled,
  onBuy,
  onSkip,
}: {
  shop: Upgrade[];
  currentBuyer: string | null;
  username: string;
  energy: number;
  disabled: boolean;
  onBuy: (upgrade: UpgradeType) => void;
  onSkip: () => void;
}) {
  const isBuyer = currentBuyer === username;

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
        {/* There are no upgrades left this round so say that to the user */}
        {shop.length === 0 ? (
          <span className="text-xs text-bone/60">No upgrades left this round.</span>
        ) : (
          shop.map((upgrade, index) => {
            const canAfford = energy >= upgrade.cost;
            return (
              <div key={`${upgrade.type}-${index}`} className="group relative">
                <button
                  type="button"
                  disabled={disabled || !isBuyer || !canAfford}
                  onClick={() => onBuy(upgrade.type)}
                  className="flex min-w-20 flex-col items-center rounded-md border-2 border-steel-dark bg-iron px-2 py-2 text-xs font-bold text-bone transition hover:border-cobber-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{UPGRADE_INFO[upgrade.type].label}</span>
                  <span className="mt-1 text-[10px] uppercase text-cobber-light">
                    {upgrade.cost} energy
                  </span>
                </button>

                {/* Description appears when hovering over the card */}
                {!disabled && isBuyer && canAfford && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-md border border-cobber-light bg-charcoal p-3 text-xs font-normal text-bone shadow-xl group-hover:block group-focus-within:block">
                    <p>{UPGRADE_INFO[upgrade.type].description}</p>
                  </div>
                )}
              </div>
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
