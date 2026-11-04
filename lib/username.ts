const USERNAME_KEY = 'username';

export function usernameError(username: string) {
  if (username.length < 3 || username.length > 16 || /\s/.test(username)) {
    return 'Username must be 3-16 characters with no spaces.';
  }

  return null;
}

export function passwordError(password: string) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (new TextEncoder().encode(password).length > 72) {
    return 'Password is too long';
  }
}

export function getUsername() {
  return window.localStorage.getItem(USERNAME_KEY);
}

export function saveUsername(username: string) {
  window.localStorage.setItem(USERNAME_KEY, username);
}

export function removeUsername() {
  window.localStorage.removeItem(USERNAME_KEY);
}
