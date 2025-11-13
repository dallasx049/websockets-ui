import { WebSocket } from 'ws';

import { ErrorMessages } from '../lib/constants.ts';
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
}

export class InvalidPasswordError extends Error {
  constructor(message = ErrorMessages.INVALID_PASSWORD) {
    super(message);
  }
}

export class PlayerNotFoundError extends Error {
  constructor(message = ErrorMessages.PLAYER_NOT_FOUND) {
    super(message);
  }
}

export class PlayersService implements IPlayersService {
  private players: Map<string, Player> = new Map();

  public createPlayer(socket: WebSocket, user: User) {
    // Check if a user exists
    const existingPlayer = this.players.get(user.name);

    if (existingPlayer) {
      // Check password correctness
      if (existingPlayer.password !== user.password) {
        throw new InvalidPasswordError();
      }

      // Update and return existing player
      const updatedPlayer = { ...existingPlayer, socket };

      this.players.set(user.name, updatedPlayer);

      return updatedPlayer;
    }

    // Create new player and store name as its key
    const player = {
      ...user,
      socket,
      id: user.name,
      score: 0,
    };

    this.players.set(user.name, player);

    return player;
  }

  public getAllPlayers() {
    return [...this.players.values()];
  }

  public getPlayerByName(name: string) {
    return this.players.get(name);
  }

  public findPlayerBySocket(socket: WebSocket) {
    return this.getAllPlayers().find((player) => player.socket === socket);
  }
}
