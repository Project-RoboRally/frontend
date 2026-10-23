import type { Register } from '@/types/register';
import { MockCards } from '@/lib/mock-cards';

// Fjern når backend for register er implementeret
export const mockRegister: Register[] = [
  { registerNumber: 1, registerRevealed: true, registerCard: null },
  { registerNumber: 2, registerRevealed: true, registerCard: null },
  { registerNumber: 3, registerRevealed: true, registerCard: null },
  { registerNumber: 4, registerRevealed: true, registerCard: null },
  { registerNumber: 5, registerRevealed: true, registerCard: null },
];
