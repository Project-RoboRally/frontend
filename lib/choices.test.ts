import { describe, expect, it } from 'vitest';

import { isUpgrade, optionLabel } from './choices';

describe('optionLabel', () => {
  it('labels the same option by what it means for the choice', () => {
    expect(optionLabel('SIDE_ARMS', 'LEFT')).toBe('To the left');
    expect(optionLabel('MOVE_ONE', 'LEFT')).toBe('Step left');
  });

  it('names upgrades and treats NONE as carrying on', () => {
    expect(optionLabel('TURN_UPGRADE', 'BOINK')).toBe('Boink');
    expect(optionLabel('TURN_UPGRADE', 'NONE')).toBe('No, continue');
  });

  it('uses the card names for card choices', () => {
    expect(optionLabel('REFRESH_CARD', 'U_TURN')).toBe('U-turn');
  });

  it('shows directions with an arrow', () => {
    expect(optionLabel('REBOOT_FACING', 'WEST')).toBe('← West');
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
