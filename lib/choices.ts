/**
 * Text for the choices activation can stop and ask a player to make: the
 * question, and the label on each answer button. The options themselves come
 * from the backend, which only sends valid ones.
 *
 * @author August
 */

import { labelForInstruction } from './programCards';
import { UPGRADE_INFO } from './upgrades';
import type { ChoiceType, UpgradeType } from '@/types/playerGameState';

// The question the player is asked for each kind of choice.
export const CHOICE_QUESTIONS: Record<ChoiceType, string> = {
  REGISTER_UPGRADE: 'Use an upgrade at the start of this register?',
  TURN_UPGRADE: 'Use an upgrade before your card is played?',
  ZOOP_FACING: 'Zoop: which way should your robot face?',
  BOINK_DIRECTION: 'Boink: which way should your robot move?',
  REFRESH_CARD: 'Refresh: which card should this register play?',
  SANDBOX_ACTION: 'Sandbox Routine: what should your robot do?',
  WEASEL_ACTION: 'Weasel Routine: which way should your robot turn?',
  SIDE_ARMS: 'Side Arms: which way should you push?',
  TELEPORT: 'Teleporter: pay 1 energy to jump instead of moving?',
  MOVE_ONE: 'How do you want to play your Move 1?',
  REBOOT_FACING: 'Your robot rebooted. Which way should it face?',
  WEAPON_UPGRADE: 'Use a weapon upgrade on this shot?',
  MODULAR_CHASSIS: 'Modular Chassis: which upgrade do you take?',
};

const DIRECTIONS: Record<string, string> = {
  NORTH: '↑ North',
  EAST: '→ East',
  SOUTH: '↓ South',
  WEST: '← West',
};

const TELEPORT_ANSWERS: Record<string, string> = {
  YES: 'Yes, teleport',
  NO: 'No, move normally',
};

const SIDE_ARMS_PUSHES: Record<string, string> = {
  FORWARD: 'Straight ahead',
  LEFT: 'To the left',
  RIGHT: 'To the right',
};

// MOVE_0 comes from Brakes, LEFT and RIGHT from Crab Legs.
const MOVE_ONE_WAYS: Record<string, string> = {
  MOVE_1: 'Move 1',
  MOVE_0: 'Brake (stay put)',
  LEFT: 'Step left',
  RIGHT: 'Step right',
};

/** Whether an option is the name of an upgrade card. */
export function isUpgrade(option: string): option is UpgradeType {
  // hasOwn, not "in": "toString" in UPGRADE_INFO is true through the prototype
  return Object.hasOwn(UPGRADE_INFO, option);
}

/**
 * The button text for one option of a choice. The type is passed too, because
 * the same option can mean different things, like LEFT for Side Arms and for
 * Crab Legs. Anything unknown is shown as it is, so it can still be picked.
 */
export function optionLabel(type: ChoiceType, option: string): string {
  switch (type) {
    case 'REGISTER_UPGRADE':
    case 'TURN_UPGRADE':
    case 'WEAPON_UPGRADE':
    case 'MODULAR_CHASSIS':
      // The backend asks again after each upgrade used, until NONE
      if (option === 'NONE') {
        return 'No, continue';
      }
      return isUpgrade(option) ? UPGRADE_INFO[option].label : option;
    case 'REFRESH_CARD':
    case 'SANDBOX_ACTION':
    case 'WEASEL_ACTION':
      return labelForInstruction(option);
    case 'ZOOP_FACING':
    case 'BOINK_DIRECTION':
    case 'REBOOT_FACING':
      return DIRECTIONS[option] ?? option;
    case 'TELEPORT':
      return TELEPORT_ANSWERS[option] ?? option;
    case 'SIDE_ARMS':
      return SIDE_ARMS_PUSHES[option] ?? option;
    case 'MOVE_ONE':
      return MOVE_ONE_WAYS[option] ?? option;
  }
  // A choice type the backend added after this was written
  return option;
}
