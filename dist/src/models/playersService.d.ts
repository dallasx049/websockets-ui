import { WebSocket } from 'ws';
import type { RegistrationSocketMessage } from '../lib/types.ts';
type User = RegistrationSocketMessage['data'];
export type Player = User & {
    score: number;
    id: string;
    socket: WebSocket;
};
export interface IPlayersService {
    createPlayer: (socket: WebSocket, user: User) => Player;
    getAllPlayers: () => Player[];
    getPlayerByName: (id: string) => Player | undefined;
    findPlayerBySocket: (socket: WebSocket) => Player | undefined;
    increaseScore: (playerName: string) => void;
}
export declare class InvalidPasswordError extends Error {
    constructor(message?: "Invalid password");
}
export declare class PlayerNotFoundError extends Error {
    constructor(message?: "Player not found");
}
export declare class PlayersService implements IPlayersService {
    private players;
    createPlayer(socket: WebSocket, user: User): {
        socket: WebSocket;
        name: string;
        password: string;
        score: number;
        id: string;
    };
    increaseScore(playerName: string): void;
    getAllPlayers(): Player[];
    getPlayerByName(name: string): Player | undefined;
    findPlayerBySocket(socket: WebSocket): Player | undefined;
}
export {};
//# sourceMappingURL=playersService.d.ts.map