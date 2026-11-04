import { expect, test } from 'vitest';
import { passwordError, usernameError } from './username';

test('alice is a valid username', () => {
  expect(usernameError('alice')).toBeNull();
});

test('a short password is rejected', () => {
  expect(passwordError('short')).not.toBeNull();
});

test('an 8 character password is accepted', () => {
  expect(passwordError('password')).toBeNull();
});
