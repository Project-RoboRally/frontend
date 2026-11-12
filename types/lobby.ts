import type { UpgradeType } from '@/types/playerGameState';

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
  kickedUsers?: string[];
  gameId?: string | null;
  started: boolean;
};

export type SetReadyRequest = {
  ready: boolean;
};

export type SetColorRequest = {
  color: PlayerColor;
};

export type CreateLobbyRequest = {
  name: string;
};

export type KickFromLobbyRequest = {
  userKicked: string;
};

export type RenameLobbyRequest = {
  name: string;
};

export type ProgramRequest = {
  registers: string[];
};

export type ProgramResponse = {
  executed: boolean;
};

export type BuyUpgradeRequest = {
  upgrade: UpgradeType;
  replace?: UpgradeType | null; // Question mark since we don't need to always replace an upgrade card
};

// choice must be one of the options in the pending choice.
export type MakeChoiceRequest = {
  choice: string;
};
