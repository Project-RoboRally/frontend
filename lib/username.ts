const USERNAME_KEY = 'username';
const TOKEN_KEY = 'token';

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
  return null;
}

export function getUsername() {
  return window.localStorage.getItem(USERNAME_KEY);
}

export function saveUsername(username: string) {
  window.localStorage.setItem(USERNAME_KEY, username);
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}
