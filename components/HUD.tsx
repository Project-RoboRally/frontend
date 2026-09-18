import { GameState, Player, ProgrammingCard } from '@/types/state';
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