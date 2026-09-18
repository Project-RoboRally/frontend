import type { ProgrammingCard } from '@/types/cards';

export function CardInfo({card}: {card: ProgrammingCard}) {
  switch(card.cardType) {
    case "move":
      return "move " + card.cardStrength;
    case "rotate":
      return "rotate " + card.cardDirection;
    case "uTurn":
      return "uTurn";
    case "back":
      return "back";
    case "power":
      return "power";
    case "again":
      return "again";
  }
}