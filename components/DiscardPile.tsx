import { Card } from '@/types/playerGameState';

export function DiscardPile({ cards }: { cards: Card[] }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center rounded-md border-2 border-cobber-dark bg-charcoal p-3 text-center">
        <div className="text-[10px] font-bold uppercase text-cobber-light"> Discard </div>
        <div className="mt-1 font-bold text-bone"> {cards.length} </div>
    </div>
  );
}
