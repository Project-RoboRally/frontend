import type { Game } from '@/types/game';

export const mockGames: Game[] = [
  {
    id: 'training-ground',
    name: 'Training Ground',
    players: ['Ada', 'Bjarne'],
  },
  {
    id: 'factory-floor',
    name: 'Factory Floor',
    players: ['Clara', 'David', 'Emil', 'Fiona', 'George'],
  },
  {
    id: 'laser-maze',
    name: 'Laser Maze',
    players: ['Fiona', 'George'],
  },
  {
    id: 'crusher-canyon',
    name: 'Crusher Canyon',
    players: ['Hanna', 'Ivan', 'Julia'],
  },
  {
    id: 'conveyor-chaos',
    name: 'Conveyor Chaos',
    players: ['Kasper'],
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    players: ['Lina', 'Malik'],
  },
  {
    id: 'warehouse-wars',
    name: 'Warehouse Wars',
    players: ['Nora', 'Oscar', 'Pia'],
  },
  {
    id: 'assembly-line',
    name: 'Assembly Line',
    players: ['Quinn'],
  },
];

export function getMockGame(gameId: string) {
  return mockGames.find((game) => game.id === gameId);
}
