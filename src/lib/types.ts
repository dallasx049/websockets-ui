import { ServerMessageTypes, SocketMessageTypes } from './constants.ts';

type RegistrationSocketMessage = {
  type: typeof SocketMessageTypes.REG;
  data: {
    name: string;
    password: string;
  };
  id: 0;
};

type CreateRoomSocketMessage = {
  type: typeof SocketMessageTypes.CREATE_ROOM;
  data: string;
  id: 0;
};

type AddPlayerToRoomSocketMessage = {
  type: typeof SocketMessageTypes.ADD_USER_TO_ROOM;
  data: {
    indexRoom: string;
  };
  id: 0;
};

export type SocketMessage =
  | RegistrationSocketMessage
  | CreateRoomSocketMessage
  | AddPlayerToRoomSocketMessage;

type RegistrationServerMessage = {
  type: typeof ServerMessageTypes.REG;
  data: {
    name: string;
    index: string;
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

type RoomUser = {
  name: string;
  index: string;
};

export type RoomState = {
  roomId: string;
  roomUsers: RoomUser[];
};

type CreateRoomServerMessage = {
  type: typeof ServerMessageTypes.UPDATE_ROOM;
  data: RoomState[];
  id: 0;
};

export type ServerMessage =
  | RegistrationServerMessage
  | ScoreboardUpdateServerMessage
  | CreateRoomServerMessage;
