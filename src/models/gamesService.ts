import { EventEmitter } from 'node:events';
import { v4 } from 'uuid';

import type { AttackStatus, Ship } from '../lib/types.ts';

type Player = {
  name: string;
  ready: boolean;
  ships: Ship[];
  battleground: BattlegroundMatrix | null;
};

type Game = {
  id: string;
  roomId: string;
  players: Map<string, Player>;
  eventEmitter: EventEmitter;
  attackTurnPlayerName: string | null;
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

  public createGame(
    roomId: string,
    playersNames: string[],
    cb: (gameId: string, players: Player[]) => void,
  ) {
    const id = v4();
    const players = new Map<string, Player>();

    playersNames.forEach((name) =>
      players.set(name, {
        name,
        ships: [],
        battleground: null,
        ready: false,
      }),
    );

    const game: Game = {
      id,
      roomId,
      players,
      eventEmitter: new EventEmitter(),
      attackTurnPlayerName: null,
    };

    this.games.set(id, game);

    game.eventEmitter.once(EventNames.START, cb);

    return game;
  }

  public addShips(gameId: string, playerName: string, ships: Ship[]) {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.players.get(playerName);
    if (!player) return;

    player.ready = true;
    player.ships = ships;
    player.battleground = this._createBattleground(ships);

    const triggerStart = [...game.players.values()].every(({ ready }) => ready);

    if (triggerStart) {
      game.eventEmitter.emit(EventNames.START, gameId, [
        ...game.players.values(),
      ]);
    }
  }

  public attack(gameId: string, playerName: string, x: number, y: number) {
    const game = this.games.get(gameId);
    if (!game) return;

    if (game.attackTurnPlayerName !== playerName) return;

    const players = [...game.players.values()];
    const enemy = players.find((player) => player.name !== playerName);
    if (!enemy) return;

    if (!enemy.battleground) return;

    const cell = enemy.battleground[x][y];

    if (cell === undefined) return;

    let status: AttackStatus;

    if (cell === null) {
      status = 'miss';
      this.switchTurn(gameId, enemy.name);
    } else {
      cell.length--;

      if (cell.length === 0) {
        status = 'killed';
      } else {
        status = 'shot';
      }
    }

    enemy.battleground[x][y] = undefined;

    return {
      playerName,
      status,
      enemyName: enemy.name,
      position: { x, y },
      attackTurnPlayerName: game.attackTurnPlayerName,
    };
  }

  public switchTurn(gameId: string, playerName: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.attackTurnPlayerName = playerName;
  }

  private _createBattleground(ships: Ship[]) {
    const battleground = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }).fill(null),
    ) as BattlegroundMatrix;

    ships.forEach(({ length, position, direction }) => {
      const cell = { length };

      if (direction) {
        for (let i = position.y; i < position.y + length; i++) {
          battleground[position.x][i] = cell;
        }
      } else {
        for (let i = position.x; i < position.x + length; i++) {
          battleground[i][position.y] = cell;
        }
      }
    });

    return battleground;
  }
}
