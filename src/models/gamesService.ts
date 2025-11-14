import { EventEmitter } from 'node:events';
import { v4 } from 'uuid';

import type { Ship } from '../lib/types.ts';

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

const EventNames = {
  START: 'start',
} as const;

export class GamesService {
  private games: Map<string, Game> = new Map();
  private gameEvent = new EventEmitter();

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

    const triggerStart = [...game.players.values()].every(({ ready }) => ready);

    if (triggerStart) {
      this.gameEvent.emit(EventNames.START, [...game.players.values()]);
    }
  }
}
