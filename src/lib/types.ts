import { ServerMessageTypes, SocketMessageTypes } from './constants.ts';

export type RegistrationSocketMessage = {
  type: typeof SocketMessageTypes.REG;
  data: {
    name: string;
    password: string;
  };
  id: 0;
};

export type CreateRoomSocketMessage = {
  type: typeof SocketMessageTypes.CREATE_ROOM;
  data: string;
  id: 0;
};

export type AddPlayerToRoomSocketMessage = {
  type: typeof SocketMessageTypes.ADD_USER_TO_ROOM;
  data: {
    indexRoom: string;
  };
  id: 0;
};

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export type AddShipsSocketMessage = {
  type: typeof SocketMessageTypes.ADD_SHIPS;
  data: {
    gameId: string;
    ships: Ship[];
    indexPlayer: string;
  };
  id: 0;
};

export type SocketMessage =
  | RegistrationSocketMessage
  | CreateRoomSocketMessage
  | AddPlayerToRoomSocketMessage
  | AddShipsSocketMessage;

type RegistrationServerMessage = {
  type: typeof ServerMessageTypes.REG;
  data: {
    name: string;
    index: string;
    error?: boolean;
    errorText?: string;
  };
  id: 0;
};

type ScoreboardUpdateServerMessage = {
  type: typeof ServerMessageTypes.UPDATE_WINNERS;
  data: {
    name: string;
    wins: number;
  }[];
  id: 0;
};

type UpdateRoomsServerMessage = {
  type: typeof ServerMessageTypes.UPDATE_ROOM;
  data: {
    roomId: string;
    roomUsers: {
      name: string;
      index: string;
    }[];
  }[];
  id: 0;
};

type StartGameServerMessage = {
  type: typeof ServerMessageTypes.START_GAME;
  data: {
    ships: Ship[];
    currentPlayerIndex: string;
  };
  id: 0;
};

type CreateGameServerMessage = {
  type: typeof ServerMessageTypes.CREATE_GAME;
  data: {
    idGame: string;
    idPlayer: string;
  };
};

export type ServerMessage =
  | RegistrationServerMessage
  | ScoreboardUpdateServerMessage
  | UpdateRoomsServerMessage
  | CreateGameServerMessage
  | StartGameServerMessage;
