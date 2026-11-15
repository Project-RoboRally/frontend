'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { useUpgrade } from '@/lib/api/game';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';

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
  const [busy, setBusy] = useState(false);

  async function handleUse() {
    setBusy(true);
    try {
      await useUpgrade(gameId, { upgrade, cards: [] });
      onDone();
    } catch (error) {
      onError(getErrorMessage(error, `Could not use ${label}.`));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`${secondaryButtonClassName} w-full text-xs`}
      disabled={disabled || busy}
      onClick={() => void handleUse()}
    >
      Use {label}
    </button>
  );
}
