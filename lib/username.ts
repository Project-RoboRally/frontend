const USERNAME_KEY = 'username';

export function usernameError(username: string) {
  if (username.length < 3 || username.length > 16 || /\s/.test(username)) {
    return 'Username must be 3–16 characters with no spaces.';
  }

  return null;
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
