import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

import type { AttackStatus, Ship } from '../lib/types.ts';
import { getRandomNum } from '../helpers/index.ts';
import { ErrorMessages } from '../lib/constants.ts';

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

type BattlegroundMatrix = (
  | Omit<Ship, 'position' | 'type' | 'direction'>
  | null
  | undefined
)[][];

const MATRIX_SIZE = 10;

const EventNames = {
  START: 'start',
  WIN: 'win',
} as const;

export class CellAlreadyHitError extends Error {
  constructor(message = ErrorMessages.CELL_ALREADY_HIT) {
    super(message);
  }
}

export class GamesService {
  private games: Map<string, Game> = new Map();

  public createGame(
    roomId: string,
    playersNames: string[],
    onGameStart: (gameId: string, players: Player[]) => void,
    onGameEnd: (gameId: string, winnerName: string, loserName: string) => void,
  ) {
    const id = randomUUID();
    const players = new Map<string, Player>();

    playersNames.forEach((name) =>
      players.set(name, {
        name,
        ships: [],
        battleground: null,
        ready: false,
        pointsToWin: 0,
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

    game.eventEmitter.once(EventNames.START, onGameStart);
    game.eventEmitter.once(EventNames.WIN, onGameEnd);

    return game;
  }

  public addShips(gameId: string, playerName: string, ships: Ship[]) {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.players.get(playerName);
    if (!player) return;

    const { battleground, pointsToWin } = this._createBattleground(ships);

    player.ready = true;
    player.ships = ships;
    player.battleground = battleground;
    player.pointsToWin = pointsToWin;

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
    const player = players.find((player) => player.name === playerName);
    const enemy = players.find((player) => player.name !== playerName);
    if (!enemy || !player || !enemy.battleground) return;

    const cell = enemy.battleground[x][y];

    if (cell === undefined) throw new CellAlreadyHitError();

    let status: AttackStatus;

    if (cell === null) {
      status = 'miss';
      this.switchTurn(gameId, enemy.name);
    } else {
      cell.length--;
      player.pointsToWin--;

      if (cell.length === 0) {
        status = 'killed';
      } else {
        status = 'shot';
      }

      if (player.pointsToWin === 0) {
        game.eventEmitter.emit(EventNames.WIN, gameId, player.name, enemy.name);
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

  public deleteGame(gameId: string) {
    this.games.delete(gameId);
  }

  public randomAttack(gameId: string, playerName: string) {
    try {
      const [x, y] = Array.from({ length: 2 }).map(() =>
        getRandomNum(0, MATRIX_SIZE),
      );

      return this.attack(gameId, playerName, x, y);
    } catch (e) {
      if (e instanceof CellAlreadyHitError) {
        console.log(e.message);
        this.randomAttack(gameId, playerName);
      } else {
        throw new Error();
      }
    }
  }

  public switchTurn(gameId: string, playerName: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.attackTurnPlayerName = playerName;
  }

  private _createBattleground(ships: Ship[]) {
    const battleground = Array.from({ length: MATRIX_SIZE }, () =>
      Array.from({ length: MATRIX_SIZE }).fill(null),
    ) as BattlegroundMatrix;

    let pointsToWin = 0;

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

      pointsToWin += length;
    });

    return { battleground, pointsToWin };
  }
}
