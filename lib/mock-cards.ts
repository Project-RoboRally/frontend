import type { ProgrammingCard } from "@/types/cards";

export const MockCards: Record<string, ProgrammingCard> = {
  "1move3": {
    cardId: "1move3",
    cardType: "move",
    cardStrength: 3
  },

  "1rotateRight": {
    cardId: "1rotateRight",
    cardType: "rotate",
    cardDirection: "right"
  },

  "1uTurn": {
    cardId: "1uTurn",
    cardType: "uTurn",
  },

  "1back": {
    cardId: "1back",
    cardType: "back"
  },

  "1power": {
    cardId: "1power",
    cardType: "power"
  },

  "1again": {
    cardId: "1again",
    cardType: "again"
  },
};