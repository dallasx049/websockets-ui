import { v4 } from 'uuid';
import { WebSocket } from 'ws';

import type { IPlayersService, Player } from './playersService.ts';
import type { RoomState } from '../lib/types.ts';
import { ErrorMessages } from '../lib/constants.ts';

type Room = {
  roomId: string;
  roomUsers: Set<WebSocket>;
  owner: WebSocket;
  joinable: boolean;
};

interface IRoomsService {
  createRoom: (owner: WebSocket) => Room;
  addPlayer: (key: string, player: WebSocket) => void;
  getAllRooms: () => Room[];
  serialize: () => RoomState[];
  getSerialized: () => RoomState[];
}

export class RoomsService implements IRoomsService {
  private rooms: Map<string, Room> = new Map();
  private playersService: IPlayersService;
  private serialized: RoomState[] = [];
  private ownerToRoomId = new Map<WebSocket, string>();

  readonly MAX_PLAYERS = 2;

  constructor(playersService: IPlayersService) {
    this.playersService = playersService;
  }

  createRoom(owner: WebSocket) {
    if (this.ownerToRoomId.has(owner)) throw new RoomAlreadyExistsError();

    const roomId = v4();

    const room = {
      roomId,
      owner,
      roomUsers: new Set<WebSocket>(),
      joinable: true,
    };

    this.rooms.set(roomId, room);
    this.ownerToRoomId.set(owner, roomId);

    return room;
  }

  addPlayer(key: string, player: WebSocket) {
    const room = this.rooms.get(key);
    if (!room) throw new RoomNotFoundError();

    room.roomUsers.add(player);

    if (room.roomUsers.size >= this.MAX_PLAYERS) {
      room.joinable = false;
    }
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  getSerialized() {
    return this.serialized;
  }

  serialize() {
    const payload = this.getAllRooms()
      .filter(({ joinable }) => joinable)
      .map((room) => ({
        ...room,
        roomUsers: [...room.roomUsers]
          .map((user) => this.playersService.getPlayer(user))
          .filter((player): player is Player => Boolean(player)),
      }));

    this.serialized = payload;

    return payload;
  }
}

export class RoomAlreadyExistsError extends Error {
  constructor(message = ErrorMessages.ROOM_ALREADY_EXISTS) {
    super(message);
  }
}

export class RoomNotFoundError extends Error {
  constructor(message = ErrorMessages.ROOM_NOT_FOUND) {
    super(message);
  }
}
