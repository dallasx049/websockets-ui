import { EventEmitter } from 'node:events';
import { v4 } from 'uuid';

import type { AttackStatus, Ship } from '../lib/types.ts';

type Player = {
  name: string;
  ships: Ship[];
  ready: boolean;
};

type Game = {
  id: string;
  roomId: string;
  players: Map<string, Player>;
};

type BattlegroundMatrix = (
  | Omit<Ship, 'position' | 'type' | 'direction'>
  | null
  | undefined
)[][];

const EventNames = {
  START: 'start',
} as const;

export class GamesService {
  private games: Map<string, Game> = new Map();
  private gameEvent = new EventEmitter();
  private battlegrounds: Map<string, BattlegroundMatrix> = new Map();

  public createGame(
    roomId: string,
    playersNames: string[],
    cb: (players: Player[]) => void,
  ) {
    const id = v4();
    const players = new Map();

    playersNames.forEach((name) => players.set(name, { name, ships: [] }));

    const game = { id, roomId, players };

    this.games.set(id, game);

    this.gameEvent.once(EventNames.START, cb);

    return game;
  }

  public addShips(gameId: string, playerName: string, ships: Ship[]) {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.players.get(playerName);
    if (!player) return;

    player.ships = ships;
    player.ready = true;

    this._createBattleground(playerName, ships);

    const triggerStart = [...game.players.values()].every(({ ready }) => ready);

    if (triggerStart) {
      this.gameEvent.emit(EventNames.START, [...game.players.values()]);
    }
  }

  public attack(gameId: string, playerName: string, x: number, y: number) {
    const game = this.games.get(gameId);
    if (!game) return;

    const players = [...game.players.values()];
    const enemy = players.find((player) => player.name !== playerName);
    if (!enemy) return;

    const enemyBattleground = this.battlegrounds.get(enemy.name);
    if (!enemyBattleground) return;

    const cell = enemyBattleground[x][y];

    if (cell === undefined) return;

    let status: AttackStatus;

    if (cell === null) {
      status = 'miss';
    } else {
      cell.length--;

      if (cell.length === 0) {
        status = 'killed';
      } else {
        status = 'shot';
      }
    }

    enemyBattleground[x][y] = undefined;

    return {
      playerName,
      status,
      enemyName: enemy.name,
      position: { x, y },
    };
  }

  private _createBattleground(playerName: string, ships: Ship[]) {
    const matrix = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }).fill(null),
    ) as BattlegroundMatrix;

    ships.forEach(({ length, position, direction }) => {
      const cell = { length };

      if (direction) {
        for (let i = position.y; i < position.y + length; i++) {
          matrix[position.x][i] = cell;
        }
      } else {
        for (let i = position.x; i < position.x + length; i++) {
          matrix[i][position.y] = cell;
        }
      }
    });

    this.battlegrounds.set(playerName, matrix);
  }
}
