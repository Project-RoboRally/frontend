import { ProgrammingCard } from '@/types/cards';
import { GameState } from '@/types/gameState';
import { Player } from '@/types/player';

import { PlayerInfo } from '@/components/PlayerInfo';
import { GameInfo } from '@/components/GameInfo';

export default function HUD({gameState, player}: {gameState: GameState, player: Player, card: ProgrammingCard}) {
    return (
        <div>
            <GameInfo gameState = {gameState}/>
            <PlayerInfo player = {player}/>
        </div>
    )
}