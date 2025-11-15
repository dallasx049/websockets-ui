import { EventEmitter } from 'node:events';
import type { AttackStatus, Ship } from '../lib/types.ts';
type Player = {
    name: string;
    ready: boolean;
    ships: Ship[];
    battleground: BattlegroundMatrix | null;
    pointsToWin: number;
};
type Game = {
    id: string;
    roomId: string;
    players: Map<string, Player>;
    eventEmitter: EventEmitter;
    attackTurnPlayerName: string | null;
};
type BattlegroundMatrix = ((Ship & {
    initialLength: number;
}) | null | undefined)[][];
export declare class CellAlreadyHitError extends Error {
    constructor(message?: "You've already hit this cell");
}
export declare class GamesService {
    private games;
    createGame(roomId: string, playersNames: string[], onGameStart: (gameId: string, players: Player[]) => void, onGameEnd: (gameId: string, winnerName: string, loserName: string) => void): Game;
    addShips(gameId: string, playerName: string, ships: Ship[]): void;
    attack(gameId: string, playerName: string, x: number, y: number): {
        playerName: string;
        status: AttackStatus;
        enemyName: string;
        coords: {
            x: number;
            y: number;
        }[];
        attackTurnPlayerName: string;
    } | undefined;
    deleteGame(gameId: string): void;
    randomAttack(gameId: string, playerName: string): {
        playerName: string;
        status: AttackStatus;
        enemyName: string;
        coords: {
            x: number;
            y: number;
        }[];
        attackTurnPlayerName: string;
    } | undefined;
    switchTurn(gameId: string, playerName: string): void;
    private _createBattleground;
}
export {};
//# sourceMappingURL=gamesService.d.ts.map