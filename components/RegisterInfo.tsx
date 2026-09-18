import { Player } from '@/types/state';
import { CardInfo } from '@/components/CardInfo';

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