'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { putBackCards, useUpgrade } from '@/lib/api/game';
import { labelForInstruction } from '@/lib/programCards';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';

/**
 * Memory Swap: use draws 3; then put exactly cardsToPutBack cards back on deck.
 * First selected card ends on top of the deck.
 * @author Elias
 */

export function MemorySwapFlow({
  gameId,
  upgrade,
  hand,
  disabled,
  onDone,
  onError,
  mode,
  cardsToPutBack,
}: ProgrammingFlowProps & {
  mode: 'use' | 'put-back';
  cardsToPutBack: number;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  function toggle(index: number) {
    setSelected((current) => {
      if (current.includes(index)) {
        return current.filter((i) => i !== index);
      }
      if (mode === 'put-back' && current.length >= cardsToPutBack) {
        return current;
      }
      return [...current, index];
    });
  }

  async function handleUse() {
    setBusy(true);
    try {
      await useUpgrade(gameId, { upgrade, cards: [] });
      onDone();
    } catch (error) {
      onError(getErrorMessage(error, 'Could not use Memory Swap.'));
    } finally {
      setBusy(false);
    }
  }

  async function handlePutBack() {
    if (selected.length !== cardsToPutBack) {
      onError(`Put back exactly ${cardsToPutBack} cards.`);
      return;
    }
    setBusy(true);
    try {
      const cards = selected.map((index) => hand[index].instruction);
      await putBackCards(gameId, { cards });
      setSelected([]);
      onDone();
    } catch (error) {
      onError(getErrorMessage(error, 'Could not put cards back.'));
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'use') {
    return (
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-xs`}
        disabled={disabled || busy}
        onClick={() => void handleUse()}
      >
        Use Memory Swap
      </button>
    );
  }

  const need = cardsToPutBack;
  const ready = selected.length === need;

  return (
    <div className="rounded border border-steel-dark bg-iron/40 p-2">
      <p className="mb-2 text-[10px] text-bone/80">
        Put exactly {need} card{need === 1 ? '' : 's'} back on your deck. First selected ends on
        top.
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
                  ? 'border-verdigris bg-verdigris-dark/40 text-bone'
                  : 'border-steel-dark bg-charcoal text-bone/80'
              }`}
            >
              {labelForInstruction(card.instruction)}
              {active ? ` - ${order + 1}` : ''}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-xs`}
        disabled={disabled || busy || !ready}
        onClick={() => void handlePutBack()}
      >
        Put back ({selected.length}/{need})
      </button>
    </div>
  );
}
