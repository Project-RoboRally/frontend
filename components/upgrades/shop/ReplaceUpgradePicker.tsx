'use client';

/**
 * Shop replace flow when buying would exceed upgrade slots.
 *
 * @author Elias
 */

import { UPGRADE_INFO } from '@/lib/upgrades';
import { secondaryButtonClassName } from '@/lib/styles';
import type { Upgrade, UpgradeType } from '@/types/playerGameState';

const SLOTS_PER_KIND = 3;

/** Routines go to the discard pile on buy - they never occupy install slots. */
const ROUTINES: UpgradeType[] = [
  'ENERGY_ROUTINE',
  'SPEED_ROUTINE',
  'REPEAT_ROUTINE',
  'SANDBOX_ROUTINE',
  'SPAM_FOLDER',
  'WEASEL_ROUTINE',
];

const TEMPORARY: UpgradeType[] = [
  'BOINK',
  'ENERGY_ROUTINE',
  'HACK',
  'MANUAL_SORT',
  'MEMORY_SWAP',
  'REBOOT',
  'RECHARGE',
  'RECOMPILE',
  'REFRESH',
  'REPEAT_ROUTINE',
  'SANDBOX_ROUTINE',
  'SPAM_BLOCKER',
  'SPAM_FOLDER',
  'SPEED_ROUTINE',
  'WEASEL_ROUTINE',
  'ZOOP',
];

export function kindOf(type: UpgradeType): 'PERMANENT' | 'TEMPORARY' {
  return TEMPORARY.includes(type) ? 'TEMPORARY' : 'PERMANENT';
}

export function isRoutine(type: UpgradeType): boolean {
  return ROUTINES.includes(type);
}

/** Installed upgrades of the same kind that can be discarded for a free slot. */
function replaceCandidates(buying: Upgrade, owned: UpgradeType[]): UpgradeType[] {
  return owned.filter((type) => !isRoutine(type) && kindOf(type) === buying.kind);
}

/** True when buying this shop card requires discarding an installed upgrade. */
export function needsReplace(buying: Upgrade, owned: UpgradeType[]): boolean {
  if (isRoutine(buying.type)) {
    return false;
  }
  return replaceCandidates(buying, owned).length >= SLOTS_PER_KIND;
}

/**
 * When permanent/temporary slots are full, pick which installed upgrade to
 * replace before buying. Routines never need replace.
 */
export function ReplaceUpgradePicker({
  buying,
  owned,
  disabled,
  onConfirm,
  onCancel,
}: {
  buying: Upgrade;
  owned: UpgradeType[];
  disabled: boolean;
  onConfirm: (replace: UpgradeType) => void;
  onCancel: () => void;
}) {
  const candidates = replaceCandidates(buying, owned);

  return (
    <div className="rounded-md border-2 border-cobber-light bg-charcoal p-3 text-left">
      <p className="mb-2 text-xs text-bone/90">
        Your {buying.kind.toLowerCase()} slots are full. Choose an upgrade to replace with{' '}
        {UPGRADE_INFO[buying.type].label}.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {candidates.map((type) => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onConfirm(type)}
            className="rounded-md border-2 border-steel-dark bg-iron px-2 py-2 text-xs font-bold text-bone hover:border-cobber-light disabled:opacity-50"
          >
            {UPGRADE_INFO[type].label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-sm`}
        disabled={disabled}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}
