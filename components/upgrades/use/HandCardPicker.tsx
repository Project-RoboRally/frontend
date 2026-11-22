import { labelForInstruction } from '@/lib/programCards';
import { selectedClassName } from '@/lib/styles';
import type { Card } from '@/types/playerGameState';

/**
 * Row of hand cards to pick from. Selecting is by hand index, and when showOrder is set
 * the position in the selection is shown next to each picked card.
 *
 * @author Elias, Sebastian
 */

export function HandCardPicker({
  cards,
  selected,
  disabled,
  showOrder = false,
  onToggle,
}: {
  cards: { card: Card; index: number }[];
  selected: number[];
  disabled: boolean;
  showOrder?: boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {cards.map(({ card, index }) => {
        const order = selected.indexOf(index);
        return (
          <button
            key={`${card.instruction}-${index}`}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(index)}
            className={`rounded border px-2 py-1 text-[10px] font-bold ${
              order >= 0
                ? `${selectedClassName} text-bone`
                : 'border-steel-dark bg-charcoal text-bone/80'
            }`}
          >
            {labelForInstruction(card.instruction)}
            {showOrder && order >= 0 ? ` - ${order + 1}` : ''}
          </button>
        );
      })}
    </div>
  );
}

/** Pairs every hand card with its index, for pickers that offer the whole hand. */
export function withIndices(hand: Card[]) {
  return hand.map((card, index) => ({ card, index }));
}
