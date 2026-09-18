import { GameState, Player, ProgrammingCard } from '@/types/state';

export default function HUD({gameState, player, card}: {gameState: GameState, player: Player, card: ProgrammingCard}) { 
    return (
        <div>
            <GameInfo gameState = {gameState}/>
            <PlayerInfo player = {player}/>
        </div>
    )
}

export function GameInfo({gameState}: {gameState: GameState}) { 
    return (
        <div>
            <p>Round: {gameState.round} </p>
            <p>Phase: {gameState.phase} </p>
        </div>
    ) 
}

export function PlayerInfo({player}: {player: Player}) { 
    return (
        <div>
            <p>Checkpoints: {player.robot.checkpointsCollected} </p>
            <p>Energy cubes: {player.robot.energycubesCollected} </p>
            <p>SPAM cards: {player.robot.damageCount} </p>
        </div>
    ) 
}

export function RegisterInfo({player}: {player: Player}) { 
    return (
        <div>
            {player.register.map((register) => ( 
                <p key = {register.registerNumber}>
                    Register {register.registerNumber} : {register.registerRevealed ? <CardInfo card = {register.registerCard}/> : "hidden"}
                </p>
            ))}
        </div>
    ) 
} 

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


export function Lobby({gameState}: {gameState: GameState}) { 
    return (
        <div>
            {gameState.status.state === "waiting" ? <p>Waiting for players! ({gameState.players.length}/6)</p> : <p>{gameState.status.state}</p>}
        </div>
    ) 
}