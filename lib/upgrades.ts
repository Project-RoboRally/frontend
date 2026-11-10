/**
 * Displays info about each upgrade card
 *
 * @author Kerem
 */

import type { UpgradeType } from '@/types/playerGameState';

export type UpgradeInfo = {
  label: string;
  description: string;
};

export const UPGRADE_INFO: Record<UpgradeType, UpgradeInfo> = {
  // Permenant upgrades
  ADMIN_PRIVILEGE: {
    label: 'Admin Privilege',
    description: 'Once per round, give your robot priority for one register.',
  },
  CORRUPTION_WAVE: {
    label: 'Corruption Wave',
    description:
      'You may put SPAM damage cards you deal on top of opponents’ decks. discard one SPAM damage card from your discard pile to the SPAM damage card draw pile.',
  },
  BLUE_SCREEN_OF_DEATH: {
    label: 'Blue Screen of Death',
    description:
      'When you shoot or push an adjacent robot, you may give that player one worm damage card instead of one SPAM damage card.',
  },
  CRAB_LEGS: {
    label: 'Crab Legs',
    description:
      'When executing a Move 1 card, you may move one space forward then one space right or left, without rotating and regardless of the direction you are facing. Then move forward one additional space in the direction you are facing.',
  },
  BRAKES: {
    label: 'Brakes',
    description: 'You may treat your Move 1’s as Move 0’s.',
  },
  DEFLECTOR_SHIELD: {
    label: 'Deflector Shield',
    description:
      'At the beginning of a register, you may spend one energy to negate any robot lasers that would hit you that register.',
  },
  CACHE_MEMORY: {
    label: 'Cache Memory',
    description:
      'You may discard cards from your hand and place them on the top of your deck. Do not draw replacement cards.',
  },
  DEFRAG_GIZMO: {
    label: 'Defrag Gizmo',
    description:
      'Once during each round, you may permanently discard one damage card from your hand. Draw a replacement card from the top of your deck.',
  },
  DOUBLE_BARREL_LASER: {
    label: 'Double Barrel Laser',
    description: 'Deal one additional SPAM damage card to any robot you shoot.',
  },
  MODULAR_CHASSIS: {
    label: 'Modular Chasis',
    description:
      'When you push another robot, give that player this card, and take one of their installed upgrades. That player keeps this card until they use it.',
  },
  FIREWALL: {
    label: 'Firewall',
    description: 'Take no SPAM damage cards when rebooting.',
  },
  PRESSOR_BEAM: {
    label: 'Pressor Beam',
    description: 'You may push any robot you shoot one space in the direc- tion you are shooting.',
  },
  HOVER_UNIT: {
    label: 'Hover Unit',
    description:
      'Your robot can pass over, but not land on, pits. If you end your move on a pit, you fall in. You can’t turn off Hover Unit, and you can’t hover above another robot.',
  },
  RAIL_GUN: {
    label: 'Rail Gun',
    description:
      'You may shoot through any number of walls and/or robots. Robots in the line of fire take one SPAM damage card.',
  },
  MEMORY_STICK: {
    label: 'Memory Stick',
    description: 'Draw one additional programming card at the start of each round.',
  },
  RAMMING_GEAR: {
    label: 'Ramming Gear',
    description: 'Deal one SPAM damage card when you push a robot.',
  },
  MINI_HOWITZER: {
    label: 'Mini Howitzer',
    description:
      'Once per register, when you shoot, you may pay one energy to deal two additional SPAM damage cards and push the attacked robot one space in the direction you are shooting.',
  },
  REAR_LASER: {
    label: 'Rear Laser',
    description: 'Your robot may shoot backward as well as forward.',
  },
  SCRAMBLER: {
    label: 'Scrambler',
    description:
      'If you attack a robot, that player replaces the card in their next register with the top card of their deck, unless it is the final register.',
  },
  TRACTOR_BEAM: {
    label: 'Tractor Beam',
    description:
      'When you shoot a robot, you may pull it toward you one space. Tractor beam may not be used on adjacent robots.',
  },
  SIDE_ARMS: {
    label: 'Side Arms',
    description:
      'When you push a robot, you may choose to push it to the left or right instead of the direction you are facing.',
  },
  TROJAN_NEEDLER: {
    label: 'Trojan Needler',
    description:
      'When you shoot or push a robot, target robot receives damage in the form of one Trojan horse damage card instead of one SPAM damage card.',
  },
  TELEPORTER: {
    label: 'Teleporter',
    description:
      'You may pay one energy to ignore obstacles when moving. This includes walls, pits, the priority antenna, and robots; however, you may not end your move on a wall, pit, or the priority antenna. If you move to a space with another robot, swap places with that robot.',
  },
  VIRUS_MODULE: {
    label: 'Virus Module',
    description: 'When you push a robot, give that player a virus damage card.',
  },

  // Temporary upgrades
  BOINK: {
    label: 'Boink',
    description: 'Move to an adjacent space. Do not change direction.',
  },
  HACK: {
    label: 'Hack',
    description:
      'Execute the programming in your current register again. This action does not replace any existing programming.',
  },
  ENERGY_ROUTINE: {
    // Special programming card
    label: 'Energy Routine',
    description: 'Take one energy cube, and place it on your player mat.',
  },
  MANUAL_SORT: {
    label: 'Manual Sort',
    description:
      'You may give your robot priority for this register. This card overrides Admin Privilege.',
  },
  MEMORY_SWAP: {
    label: 'Memory Swap',
    description: 'Draw three cards. Then choose three from your hand to put on top of your deck.',
  },
  REPEAT_ROUTINE: {
    // Special programming card
    label: 'Repeat Routine',
    description:
      'Repeat the programming in your previous register. If your previous register was a damage card, draw a card from the top of your deck, and play that card this register. If you used an upgrade in your previous register that allowed you to play multiple programming cards, re-execute the second card.',
  },
  REBOOT: {
    label: 'Reboot',
    description: 'Reboot your robot, but take no damage.',
  },
  SANDBOX_ROUTINE: {
    // Special programming card
    label: 'Sandbox Routine',
    description:
      'Choose one of the following actions to perform this register: Move 1, 2, or 3, Back Up, Turn Left, Turn Right, U-Turn.',
  },
  RECHARGE: {
    label: 'Recharge',
    description: 'Gain three energy.',
  },
  SPAM_BLOCKER: {
    label: 'Spam Blocker',
    description:
      'Replace each SPAM damage card in your hand with a card from the top of your deck. Immediately discard the SPAM damage cards by placing them in the SPAM damage card draw pile. If you draw new SPAM damage cards from your deck, keep them in your hand for this round.',
  },
  RECOMPILE: {
    label: 'Recompile',
    description:
      'Discard your entire hand. Draw a new one. If you need to reshuffle your discard pile to replenish your deck, you may.',
  },
  SPAM_FOLDER: {
    // It's real name is Spam Folder Routine (Special programming card)
    label: 'Spam Folder Routine',
    description:
      'Permanently discard one SPAM damage card from your discard pile to the SPAM damage card draw pile.',
  },
  REFRESH: {
    label: 'Refresh',
    description:
      'Change the programming in your current register to any of the following: Move 1, 2, or 3; Turn Left; Turn Right; U-Turn; Back Up; Again. If you’re replacing a damage card, you may permanently discard the damage card.',
  },
  SPEED_ROUTINE: {
    // Special programming card
    label: 'Speed Routine',
    description: 'Move your robot 3 spaces in the direction it is facing.',
  },
  WEASEL_ROUTINE: {
    // Special programming card
    label: 'Weasel Routine',
    description:
      'Choose one of the following actions to perform this register: Turn Left, Turn Right, U-Turn',
  },
  ZOOP: {
    label: 'Zoop',
    description: 'Rotate to face any direction.',
  },
};
