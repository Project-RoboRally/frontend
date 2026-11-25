'use client';

import { useState } from 'react';
import { postUseUpgrade, putBackCards } from '@/lib/api/game';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';
import { HandCardPicker, withIndices } from '@/components/upgrades/use/HandCardPicker';
import { useBusyAction } from '@/components/upgrades/use/useBusyAction';

/**
 * Memory Swap: use draws 3; then put exactly cardsToPutBack cards back on deck.
 * First selected card ends on top of the deck.
 * @author Elias, Sebastian
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
  const { busy, run } = useBusyAction(onError);

  function toggle(index: number) {
    setSelected((current) => {
      if (current.includes(index)) {
        return current.filter((i) => i !== index);
      }
      if (current.length >= cardsToPutBack) {
        return current;
      }
      return [...current, index];
    });
  }

  async function handlePutBack() {
    if (selected.length !== cardsToPutBack) {
      onError(`Put back exactly ${cardsToPutBack} cards.`);
      return;
    }
    await run(async () => {
      const cards = selected.map((index) => hand[index].instruction);
      await putBackCards(gameId, { cards });
      setSelected([]);
      onDone();
    }, 'Could not put cards back.');
  }

  if (mode === 'use') {
    return (
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-xs`}
        disabled={disabled || busy}
        onClick={() =>
          void run(async () => {
            await postUseUpgrade(gameId, { upgrade, cards: [] });
            onDone();
          }, 'Could not use Memory Swap.')
        }
      >
        Use Memory Swap
      </button>
    );
  }

  return (
    <div className="rounded border border-steel-dark bg-iron/40 p-2">
      <p className="mb-2 text-[10px] text-bone/80">
        Put exactly {cardsToPutBack} card{cardsToPutBack === 1 ? '' : 's'} back on your deck. First
        selected ends on top.
      </p>
      <HandCardPicker
        cards={withIndices(hand)}
        selected={selected}
        disabled={disabled || busy}
        showOrder
        onToggle={toggle}
      />
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-xs`}
        disabled={disabled || busy || selected.length !== cardsToPutBack}
        onClick={() => void handlePutBack()}
      >
        Put back ({selected.length}/{cardsToPutBack})
      </button>
    </div>
  );
}
