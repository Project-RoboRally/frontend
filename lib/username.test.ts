import { expect, test } from 'vitest';
import { passwordError, usernameError } from './username';

test('validates account usernames', () => {
  expect(usernameError('alice')).toBeNull();
  expect(usernameError('ab')).not.toBeNull();
  expect(usernameError('a username')).not.toBeNull();
  expect(usernameError('a'.repeat(17))).not.toBeNull();
});

test('validates password minimum and UTF-8 byte limit', () => {
  expect(passwordError('short')).toBe('Password must be at least 8 characters.');
  expect(passwordError('12345678')).toBeNull();
  expect(passwordError('😀'.repeat(18))).toBeNull();
  expect(passwordError('😀'.repeat(19))).toBe('Password must be no more than 72 UTF-8 bytes.');
});
