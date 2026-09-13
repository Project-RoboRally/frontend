const USERNAME_KEY = "username";

export function getUsername() {
  return window.localStorage.getItem(USERNAME_KEY);
}

export function saveUsername(username: string) {
  window.localStorage.setItem(USERNAME_KEY, username);
}

export function removeUsername() {
  window.localStorage.removeItem(USERNAME_KEY);
}