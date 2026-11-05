export function usernameError(username: string) {
  if (username.length < 3 || username.length > 16 || /\s/.test(username)) {
    return 'Username must be 3-16 characters with no spaces.';
  }

  return null;
}

export function passwordError(password: string) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (new TextEncoder().encode(password).byteLength > 72) {
    return 'Password must be no more than 72 UTF-8 bytes.';
  }
  return null;
}
