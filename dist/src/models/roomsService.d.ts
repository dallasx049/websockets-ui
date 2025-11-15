import { WebSocket } from 'ws';
import { type IPlayersService } from './playersService.ts';
type Room = {
    id: string;
    players: Set<string>;
    open: boolean;
};
interface IRoomsService {
    createRoom: (socket: WebSocket) => Room;
    getRooms: (type: 'open' | 'all') => Room[];
    leaveAllRooms: (socket: WebSocket) => void;
    joinRoom: (roomId: string, socket: WebSocket) => void | {
        roomPlayers: string[];
    };
}
export declare class RoomNotFoundError extends Error {
    constructor(message?: "Room not found");
}
export declare class PlayerAlreadyJoinedRoomError extends Error {
    constructor(message?: "Player already joined this room");
}
export declare class RoomsService implements IRoomsService {
    private MAX_PLAYERS;
    private playersService;
    private rooms;
    constructor(playersService: IPlayersService);
    createRoom(socket: WebSocket): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        players: Set<string>;
        open: boolean;
    };
    getRooms(type: 'open' | 'all'): Room[];
    joinRoom(roomId: string, socket: WebSocket): {
        roomPlayers: string[];
    } | undefined;
    leaveAllRooms(socket: WebSocket): void;
    private _findAllRoomsByPlayerName;
}
export {};
//# sourceMappingURL=roomsService.d.ts.map