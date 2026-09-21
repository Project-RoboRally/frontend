export type Lobby = {
  id: string;
  name: string;
  players: string[];
};

// TODO: id is client-generated until the backend assigns it (a LobbyService will own this later)
export type CreateLobbyRequest = {
  id: string;
  name: string;
  username: string;
};

export type JoinLobbyRequest = {
  username: string;
};
