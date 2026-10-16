import { expect, test } from 'vitest';
import { usernameError } from './username';

test('alice is a valid username', () => {
  expect(usernameError('alice')).toBeNull();
});
