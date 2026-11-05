import type { Card } from '@/types/playerGameState';
import type { ProgrammingCard  } from '@/types/cards';

/**
 * Translating backend cards to frontend
 *
 * @author Kerem
 */

// Backend to frontend
export function toProgrammingCard(card: Card, handIndex: number): ProgrammingCard | null { 
    const cardId = `${card.instruction}-${handIndex}`; // Unique id, since there can be duplicates of the same tyoe

    if (card.type !== 'PROGRAMMING') return null;

    switch(card.instruction) {
        case 'MOVE_1': return {cardId, cardType: 'move', cardStrength: 1};
        case 'MOVE_2': return {cardId, cardType: 'move', cardStrength: 2};
        case 'MOVE_3': return {cardId, cardType: 'move', cardStrength: 3};
        case 'LEFT_TURN': return {cardId, cardType: 'rotate', cardDirection: 'left'};
        case 'RIGHT_TURN': return {cardId, cardType: 'rotate', cardDirection: 'right'};
        case 'U_TURN': return {cardId, cardType: 'uTurn'};
        case 'MOVE_BACK': return {cardId, cardType: 'back'};
        case 'POWER_UP': return {cardId, cardType: 'power'};
        case 'AGAIN': return {cardId, cardType: 'again'};
        case 'ENERGY_ROUTINE': return {cardId, cardType: 'energyRoutine'};
        case 'SPEED_ROUTINE': return {cardId, cardType: 'speedRoutine'};
        case 'REPEAT_ROUTINE': return {cardId, cardType: 'repeatRoutine'};
        default: 
            console.warn('Unrecoqnized instrution:', card.instruction);
            return null;
    }
}

// Frontend to backend
export function toInstruction(card: ProgrammingCard): string {
    switch (card.cardType) {
        case 'move': return `MOVE_${card.cardStrength}`;
        case 'rotate': return card.cardDirection === 'left' ? 'LEFT_TURN' : 'RIGHT_TURN';
        case 'uTurn': return 'U_TURN';
        case 'back': return 'MOVE_BACK';
        case 'power': return 'POWER_UP';
        case 'again': return 'AGAIN';
        case 'energyRoutine': return 'ENERGY_ROUTINE';
        case 'speedRoutine': return 'SPEED_ROUTINE';
        case 'repeatRoutine': return 'REPEAT_ROUTINE';
    }
}