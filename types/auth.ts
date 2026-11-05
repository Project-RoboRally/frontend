export type Credentials = {
  username: string;
  password: string;
};

export type AuthSession = {
  username: string;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
