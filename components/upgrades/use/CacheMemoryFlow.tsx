'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { useUpgrade as postUseUpgrade } from '@/lib/api/game';
import { labelForInstruction } from '@/lib/programCards';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';

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
  const [busy, setBusy] = useState(false);

  function toggle(index: number) {
    setSelected((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  }

  async function handleConfirm() {
    if (selected.length === 0) {
      onError('Pick at least one card to put on your deck.');
      return;
    }
    setBusy(true);
    try {
      const cards = selected.map((index) => hand[index].instruction);
      await postUseUpgrade(gameId, { upgrade, cards });
      setOpen(false);
      setSelected([]);
      onDone();
    } catch (error) {
      onError(getErrorMessage(error, 'Could not use Cache Memory.'));
    } finally {
      setBusy(false);
    }
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
      <div className="mb-2 flex flex-wrap gap-1">
        {hand.map((card, index) => {
          const active = selected.includes(index);
          const order = selected.indexOf(index);
          return (
            <button
              key={`${card.instruction}-${index}`}
              type="button"
              disabled={disabled || busy}
              onClick={() => toggle(index)}
              className={`rounded border px-2 py-1 text-[10px] font-bold ${
                active
                  ? 'border-cobber-light bg-cobber-dark/40 text-bone'
                  : 'border-steel-dark bg-charcoal text-bone/80'
              }`}
            >
              {labelForInstruction(card.instruction)}
              {active ? ` - ${order + 1}` : ''}
            </button>
          );
        })}
      </div>
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
          onClick={() => {
            setOpen(false);
            setSelected([]);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
