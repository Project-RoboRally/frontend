import type { ProgrammingCard } from '@/types/cards';

/**
 * Assigns each register with a card type (Communication between backend and frontend)
 * 
 * @author Kerem, Matthias
 */

export function CardInfo({card}: {card: ProgrammingCard}) {
  switch(card.cardType) {
    case "move":
      return <span>move {card.cardStrength}</span>;
    case "rotate":
      return <span>rotate {card.cardDirection}</span>;
    case "uTurn":
      return <span>uTurn</span>;
    case "back":
      return <span>back</span>;
    case "power":
      return <span>power</span>;
    case "again":
      return <span>again</span>;
  }
}