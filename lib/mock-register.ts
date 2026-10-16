import type { Register } from "@/types/register";
import { MockCards } from "@/lib/mock-cards";

// Fjern når backend for register er implementeret
export  const mockRegister: Register[] = [
    { registerNumber: 1, registerRevealed: true, registerCard: MockCards["1move3"] },
    { registerNumber: 2, registerRevealed: true, registerCard: MockCards["1rotateRight"] },
    { registerNumber: 3, registerRevealed: false, registerCard: null },
    { registerNumber: 4, registerRevealed: true, registerCard: null },
    { registerNumber: 5, registerRevealed: false, registerCard: MockCards["1uTurn"] }
  ];