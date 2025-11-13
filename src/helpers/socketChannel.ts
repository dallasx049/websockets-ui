import { WebSocket, type WebSocketServer } from 'ws';

import type { ServerMessage, SocketMessage } from '../lib/types.ts';
import { ErrorMessages } from '../lib/constants.ts';

type BroadcastOptions = {
  excludeSelf?: boolean;
  clients?: WebSocket[];
};

type Message = Omit<ServerMessage, 'id'>;

export interface ISocketChannel {
  getSocket: () => WebSocket;
  send: <T extends Message>(message: T) => Promise<void>;
  broadcast: <T extends Message>(
    message: T,
    options?: BroadcastOptions,
  ) => Promise<void>;
}

export class SocketNotOpenError extends Error {
  constructor(message = ErrorMessages.SOCKET_NOT_OPEN) {
    super(message);
  }
}

export class InvalidMessageFormatError extends Error {
  constructor(message = ErrorMessages.INVALID_MESSAGE_FORMAT) {
    super(message);
  }
}

export class SocketChannel implements ISocketChannel {
  private server: WebSocketServer;
  private socket: WebSocket;

  constructor(socket: WebSocket, server: WebSocketServer) {
    this.socket = socket;
    this.server = server;
  }

  getSocket() {
    return this.socket;
  }

  send<T extends Message>(message: T): Promise<void> {
    if (this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new SocketNotOpenError());
    }

    return new Promise((res, rej) => {
      const body = JSON.stringify({
        id: 0,
        type: message.type,
        data: JSON.stringify(message.data),
      });

      this.socket.send(body, (err) => {
        if (err) rej(err);
        res();
      });
    });
  }

  async broadcast<T extends Message>(
    message: T,
    options?: {
      excludeSelf?: boolean;
      clients?: WebSocket[];
    },
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    const clients = options?.clients
      ? new Set(options?.clients)
      : this.server.clients;

    const body = JSON.stringify({
      id: 0,
      type: message.type,
      data: JSON.stringify(message.data),
    });

    clients.forEach((client) => {
      if (options?.excludeSelf && client === this.socket) return;
      if (client.readyState !== WebSocket.OPEN) return;

      promises.push(
        new Promise((res, rej) => {
          client.send(body, (err) => {
            if (err) rej(err);
            res();
          });
        }),
      );
    });

    await Promise.all(promises);
  }

  static parse(raw: WebSocket.RawData): SocketMessage {
    try {
      const message = JSON.parse(raw.toString());

      return {
        ...message,
        data: message.data === '' ? message.data : JSON.parse(message.data),
      };
    } catch {
      throw new InvalidMessageFormatError();
    }
  }
}
