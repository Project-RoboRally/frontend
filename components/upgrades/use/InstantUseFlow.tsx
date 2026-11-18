'use client';

import { postUseUpgrade } from '@/lib/api/game';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';
import { useBusyAction } from '@/components/upgrades/use/useBusyAction';

/**
 * One-click programming upgrades: Recharge, Recompile, Spam Blocker.
 * @author Elias
 */

export function InstantUseFlow({
  gameId,
  upgrade,
  label,
  disabled,
  onDone,
  onError,
}: ProgrammingFlowProps & { label: string }) {
  const { busy, run } = useBusyAction(onError);

  return (
    <button
      type="button"
      className={`${secondaryButtonClassName} w-full text-xs`}
      disabled={disabled || busy}
      onClick={() =>
        void run(async () => {
          await postUseUpgrade(gameId, { upgrade, cards: [] });
          onDone();
        }, `Could not use ${label}.`)
      }
    >
      Use {label}
    </button>
  );
}
