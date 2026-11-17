'use client';

import { useState } from 'react';
import { postUseUpgrade } from '@/lib/api/game';
import { labelForInstruction } from '@/lib/programCards';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';
import { HandCardPicker, withIndices } from '@/components/upgrades/use/HandCardPicker';
import { useBusyAction } from '@/components/upgrades/use/useBusyAction';

/**
 * Cache Memory: pick hand cards to put on top of the deck (first = top).
 * @author Elias
 */

export function CacheMemoryFlow({
  gameId,
  upgrade,
  hand,
  disabled,
  onDone,
  onError,
}: ProgrammingFlowProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const { busy, run } = useBusyAction(onError);

  function toggle(index: number) {
    setSelected((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  }

  function reset() {
    setOpen(false);
    setSelected([]);
  }

  async function handleConfirm() {
    if (selected.length === 0) {
      onError('Pick at least one card to put on your deck.');
      return;
    }
    await run(async () => {
      const cards = selected.map((index) => hand[index].instruction);
      await postUseUpgrade(gameId, { upgrade, cards });
      reset();
      onDone();
    }, 'Could not use Cache Memory.');
  }

  if (!open) {
    return (
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-xs`}
        disabled={disabled || hand.length === 0}
        onClick={() => setOpen(true)}
      >
        Use Cache Memory
      </button>
    );
  }

  return (
    <div className="rounded border border-steel-dark bg-iron/40 p-2">
      <p className="mb-2 text-[10px] font-semibold text-bone">
        Cache Memory: put cards on top of your deck (first selected ends on top).
      </p>
      <HandCardPicker
        cards={withIndices(hand)}
        selected={selected}
        disabled={disabled || busy}
        showOrder
        onToggle={toggle}
      />
      {selected.length > 0 ? (
        <p className="mb-2 text-[10px] text-bone/70">
          Top of deck:{' '}
          {selected.map((index) => labelForInstruction(hand[index].instruction)).join(', then ')}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          className={`${secondaryButtonClassName} flex-1 text-xs`}
          disabled={disabled || busy || selected.length === 0}
          onClick={() => void handleConfirm()}
        >
          Confirm ({selected.length})
        </button>
        <button
          type="button"
          className={`${secondaryButtonClassName} flex-1 text-xs`}
          disabled={busy}
          onClick={reset}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
