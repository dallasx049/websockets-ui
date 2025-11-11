import { WebSocket, type WebSocketServer } from 'ws';

import type { ServerMessage, SocketMessage } from '../lib/types.ts';
import { ErrorMessages } from '../lib/constants.ts';

type BroadcastOptions = {
  excludeSelf?: boolean;
  clients?: Set<WebSocket>;
};

interface ISocketChannel {
  send: <T extends Omit<ServerMessage, 'id'>>(message: T) => Promise<void>;
  broadcast: <T extends Omit<ServerMessage, 'id'>>(
    message: T,
    options?: BroadcastOptions,
  ) => Promise<void>;
}

export class SocketChannel implements ISocketChannel {
  private server: WebSocketServer;
  private socket: WebSocket;

  constructor(socket: WebSocket, server: WebSocketServer) {
    this.socket = socket;
    this.server = server;
  }

  send<T extends Omit<ServerMessage, 'id'>>(message: T): Promise<void> {
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

  async broadcast<T extends Omit<ServerMessage, 'id'>>(
    message: T,
    options?: {
      excludeSelf?: boolean;
      clients?: Set<WebSocket>;
    },
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    const clients = options?.clients ?? this.server.clients;

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

class SocketNotOpenError extends Error {
  constructor(message = ErrorMessages.SOCKET_NOT_OPEN) {
    super(message);
  }
}

class InvalidMessageFormatError extends Error {
  constructor(message = ErrorMessages.INVALID_MESSAGE_FORMAT) {
    super(message);
  }
}
