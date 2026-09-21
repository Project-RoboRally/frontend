export type Lobby = {
  id: string;
  name: string;
  players: string[];
  createdBy: string;
};

export type CreateLobbyRequest = {
  name: string;
  username: string;
};

export type JoinLeaveLobbyRequest = {
  username: string;
};

export type KickFromLobbyRequest = {
  kickedBy: string;
  playerKicked: string;
}

export type RenameLobbyRequest = {
  name: string;
};