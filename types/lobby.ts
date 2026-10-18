export type PlayerColor = 'RED' | 'BLUE' | 'PINK' | 'GREEN' | 'PURPLE' | 'ORANGE';

export type LobbyMember = {
  username: string;
  color: PlayerColor;
  ready: boolean;
  owner: boolean;
};

export type Lobby = {
  id: string;
  name: string;
  users: string[];
  createdBy: string | null;
  members?: LobbyMember[];
  gameId?: string | null;
  started: boolean;
};

export type SetReadyRequest = {
  username: string;
  ready: boolean;
};

export type SetColorRequest = {
  username: string;
  color: PlayerColor;
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
  userKicked: string;
};

export type RenameLobbyRequest = {
  name: string;
};

export type ProgramRequest = {
  username: string;
  registers: string[];
};

export type ProgramResponse = {
  executed: boolean;
};
