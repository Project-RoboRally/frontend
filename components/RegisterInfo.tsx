import { Player } from '@/types/player';
import { CardInfo } from '@/components/CardInfo';

/**
 * Displays the type of each card in the register (Can be hidden too)
 * 
 * @author Kerem, Matthias
 */

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