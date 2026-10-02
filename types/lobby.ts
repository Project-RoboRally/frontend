export type Lobby = {
  id: string;
  name: string;
  users: string[];
  createdBy: string | null;
  started: boolean;
};

export type CreateLobbyRequest = {
  id: string;
  name: string;
  username: string;
};

export type JoinLeaveLobbyRequest = {
  username: string;
};

export type KickFromLobbyRequest = {
  kickedBy: string;
  userKicked: string;
}

export type RenameLobbyRequest = {
  name: string;
};