import type { WebSocket } from 'ws';
import { v4 } from 'uuid';

import { ErrorMessages } from '../lib/constants.ts';

export type Player = {
  name: string;
  wins: number;
  index: string;
};

type Body = Omit<Player, 'index' | 'wins'>;

export interface IPlayersService {
  createPlayer: (key: WebSocket, body: Body) => Player;
  removePlayer: (key: WebSocket) => Player | undefined;
  getPlayer: (key: WebSocket) => Player | undefined;
  getAllPlayers: () => Player[];
}

export class PlayerAlreadyExistsError extends Error {
  constructor(message = ErrorMessages.PLAYER_ALREADY_EXISTS) {
    super(message);
  }
}

export class PlayerNotExistsError extends Error {
  constructor(message = ErrorMessages.PLAYER_NOT_EXISTS) {
    super(message);
  }
}

export class PlayersService implements IPlayersService {
  private players: Map<WebSocket, Player> = new Map();
  private names = new Set<string>();

  createPlayer(key: WebSocket, body: Body): Player {
    if (this.names.has(body.name)) {
      throw new PlayerAlreadyExistsError();
    }

    const player = { name: body.name, index: v4(), wins: 0 };

    this.players.set(key, player);
    this.names.add(body.name);

    return player;
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  removePlayer(key: WebSocket) {
    const player = this.getPlayer(key);
    if (!player) throw new PlayerNotExistsError();

    this.players.delete(key);
    this.names.delete(player.name);

    return player;
  }

  getPlayer(key: WebSocket) {
    return this.players.get(key);
  }
}
