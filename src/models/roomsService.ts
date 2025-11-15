import { WebSocket } from 'ws';
import { v4 } from 'uuid';

import { type IPlayersService, PlayerNotFoundError } from './playersService.ts';
import { ErrorMessages } from '../lib/constants.ts';

type Room = {
  id: string;
  players: Set<string>;
  open: boolean;
};

interface IRoomsService {
  createRoom: (socket: WebSocket) => Room;
  getRooms: (type: 'open' | 'all') => Room[];
  leaveAllRooms: (socket: WebSocket) => void;
  joinRoom: (
    roomId: string,
    socket: WebSocket,
  ) => void | {
    roomPlayers: string[];
  };
}

export class RoomNotFoundError extends Error {
  constructor(message = ErrorMessages.ROOM_NOT_FOUND) {
    super(message);
  }
}

export class PlayerAlreadyJoinedRoomError extends Error {
  constructor(message = ErrorMessages.PLAYER_ALREADY_JOINED) {
    super(message);
  }
}

export class RoomsService implements IRoomsService {
  private MAX_PLAYERS = 2;

  private playersService: IPlayersService;
  private rooms: Map<string, Room> = new Map();

  constructor(playersService: IPlayersService) {
    this.playersService = playersService;
  }

  public createRoom(socket: WebSocket) {
    const player = this.playersService.findPlayerBySocket(socket);
    if (!player) throw new PlayerNotFoundError();

    const roomId = v4();
    const room = {
      id: roomId,
      players: new Set<string>(),
      open: true,
    };

    this.rooms.set(roomId, room);

    return room;
  }

  public getRooms(type: 'open' | 'all') {
    const rooms = [...this.rooms.values()];

    if (type === 'open') {
      return rooms.filter(({ open }) => open);
    }

    return rooms;
  }

  public joinRoom(roomId: string, socket: WebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) throw new RoomNotFoundError();

    const player = this.playersService.findPlayerBySocket(socket);
    if (!player) return;

    if (room.players.has(player.name)) throw new PlayerAlreadyJoinedRoomError();

    this.leaveAllRooms(socket);

    room.players.add(player.name);

    if (room.players.size >= this.MAX_PLAYERS) {
      room.open = false;
      return { roomPlayers: [...room.players] };
    }
  }

  public leaveAllRooms(socket: WebSocket) {
    const player = this.playersService.findPlayerBySocket(socket);
    if (!player) return;

    const rooms = this._findAllRoomsByPlayerName(player.name);
    if (!rooms.length) return;

    rooms.forEach((room) => {
      if (room.players.size >= this.MAX_PLAYERS) {
        [...room.players].forEach((name) => {
          const _player = this.playersService.getPlayerByName(name);
          _player?.socket.close();
        });
        this.rooms.delete(room.id);
      }

      room.players.delete(player.name);
      room.open = true;
    });
  }

  private _findAllRoomsByPlayerName(playerName: string) {
    const rooms: Room[] = [];

    this.rooms.forEach((room) => {
      if (room.players.has(playerName)) {
        rooms.push(room);
      }
    });

    return rooms;
  }
}
