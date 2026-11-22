/**
 * @author Elias, August
 */

import { describe, expect, it } from 'vitest';

import { CHOICE_QUESTIONS, isUpgrade, optionLabel } from './choices';
import type { ChoiceType } from '@/types/playerGameState';

const ALL_CHOICE_TYPES: ChoiceType[] = [
  'REGISTER_UPGRADE',
  'TURN_UPGRADE',
  'ZOOP_FACING',
  'BOINK_DIRECTION',
  'REFRESH_CARD',
  'SANDBOX_ACTION',
  'WEASEL_ACTION',
  'SIDE_ARMS',
  'TELEPORT',
  'MOVE_ONE',
  'WEAPON_UPGRADE',
  'MODULAR_CHASSIS',
  'REBOOT_FACING',
  'DAMAGE_TYPE',
];

describe('CHOICE_QUESTIONS', () => {
  it('has a human-readable question for every ChoiceType', () => {
    for (const type of ALL_CHOICE_TYPES) {
      expect(CHOICE_QUESTIONS[type].length).toBeGreaterThan(0);
      expect(CHOICE_QUESTIONS[type]).not.toBe(type);
    }
  });
});

describe('optionLabel', () => {
  it('labels the same option by what it means for the choice', () => {
    expect(optionLabel('SIDE_ARMS', 'LEFT')).toBe('To the left');
    expect(optionLabel('MOVE_ONE', 'LEFT')).toBe('Step left');
  });

  it('names upgrades and treats NONE as carrying on', () => {
    expect(optionLabel('REGISTER_UPGRADE', 'ADMIN_PRIVILEGE')).toBe('Admin Privilege');
    expect(optionLabel('REGISTER_UPGRADE', 'MANUAL_SORT')).toBe('Manual Sort');
    expect(optionLabel('REGISTER_UPGRADE', 'DEFLECTOR_SHIELD')).toBe('Deflector Shield');
    expect(optionLabel('REGISTER_UPGRADE', 'NONE')).toBe('No, continue');

    expect(optionLabel('TURN_UPGRADE', 'BOINK')).toBe('Boink');
    expect(optionLabel('TURN_UPGRADE', 'ZOOP')).toBe('Zoop');
    expect(optionLabel('TURN_UPGRADE', 'HACK')).toBe('Hack');
    expect(optionLabel('TURN_UPGRADE', 'REFRESH')).toBe('Refresh');
    expect(optionLabel('TURN_UPGRADE', 'REBOOT')).toBe('Reboot');
    expect(optionLabel('TURN_UPGRADE', 'RECHARGE')).toBe('Recharge');
    expect(optionLabel('TURN_UPGRADE', 'NONE')).toBe('No, continue');

    expect(optionLabel('WEAPON_UPGRADE', 'MINI_HOWITZER')).toBe('Mini Howitzer');
    expect(optionLabel('WEAPON_UPGRADE', 'PRESSOR_BEAM')).toBe('Pressor Beam');
    expect(optionLabel('WEAPON_UPGRADE', 'TRACTOR_BEAM')).toBe('Tractor Beam');
    expect(optionLabel('WEAPON_UPGRADE', 'CORRUPTION_WAVE')).toBe('Corruption Wave');
    expect(optionLabel('WEAPON_UPGRADE', 'BLUE_SCREEN_OF_DEATH')).toBe('Blue Screen of Death');
    expect(optionLabel('WEAPON_UPGRADE', 'NONE')).toBe('No, continue');

    expect(optionLabel('MODULAR_CHASSIS', 'FIREWALL')).toBe('Firewall');
  });

  it('uses the card names for card choices', () => {
    expect(optionLabel('REFRESH_CARD', 'U_TURN')).toBe('U-turn');
    expect(optionLabel('SANDBOX_ACTION', 'MOVE_1')).toBe('Move 1');
    expect(optionLabel('WEASEL_ACTION', 'LEFT_TURN')).toBe('Turn left');
  });

  it('shows directions with an arrow', () => {
    expect(optionLabel('ZOOP_FACING', 'NORTH')).toBe('↑ North');
    expect(optionLabel('BOINK_DIRECTION', 'EAST')).toBe('→ East');
    expect(optionLabel('REBOOT_FACING', 'WEST')).toBe('← West');
    expect(optionLabel('REBOOT_FACING', 'SOUTH')).toBe('↓ South');
  });

  it('labels Side Arms pushes', () => {
    expect(optionLabel('SIDE_ARMS', 'FORWARD')).toBe('Straight ahead');
    expect(optionLabel('SIDE_ARMS', 'LEFT')).toBe('To the left');
    expect(optionLabel('SIDE_ARMS', 'RIGHT')).toBe('To the right');
  });

  it('labels Teleporter yes/no', () => {
    expect(optionLabel('TELEPORT', 'YES')).toBe('Yes, teleport');
    expect(optionLabel('TELEPORT', 'NO')).toBe('No, move normally');
  });

  it('labels Move 1 variants from Brakes and Crab Legs', () => {
    expect(optionLabel('MOVE_ONE', 'MOVE_1')).toBe('Move 1');
    expect(optionLabel('MOVE_ONE', 'MOVE_0')).toBe('Brake (stay put)');
    expect(optionLabel('MOVE_ONE', 'LEFT')).toBe('Step left');
    expect(optionLabel('MOVE_ONE', 'RIGHT')).toBe('Step right');
  });

  it('names the other damage types when a pile is empty', () => {
    expect(optionLabel('DAMAGE_TYPE', 'WORM')).toBe('Worm');
    expect(optionLabel('DAMAGE_TYPE', 'TROJAN_HORSE')).toBe('Trojan horse');
    expect(optionLabel('DAMAGE_TYPE', 'VIRUS')).toBe('Virus');
  });

  it('shows an unknown option as it is, so it can still be picked', () => {
    expect(optionLabel('TELEPORT', 'MAYBE')).toBe('MAYBE');
  });
});

describe('isUpgrade', () => {
  it('only matches upgrade names, not object properties', () => {
    expect(isUpgrade('TELEPORTER')).toBe(true);
    expect(isUpgrade('NONE')).toBe(false);
    expect(isUpgrade('toString')).toBe(false);
  });
});
