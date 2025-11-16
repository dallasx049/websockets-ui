import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

import { Env, SocketMessageTypes } from './lib/constants.ts';
import { SocketChannel } from './helpers/index.ts';
import {
  handleRegistration,
  handleCreateRoom,
  handleSocketClose,
  handleJoinRoom,
  handleAddShips,
  handleAttack,
  handleRandomAttack,
} from './controllers/index.ts';

const STALENESS_CHECK_TIMEOUT = 30_000;

const httpServer = createServer();
const wsServer = new WebSocketServer({ server: httpServer });

const aliveSockets = new Set<WebSocket>();

wsServer.on('connection', (socket) => {
  const socketChannel = new SocketChannel(socket, wsServer);
  aliveSockets.add(socket);

  console.log('Socket connected to the server');

  socket.on('pong', () => aliveSockets.add(socket));

  socket.on('error', (e) => {
    console.log('Socket terminated with error: ', e);
    socket.terminate();
  });

  socket.on('close', async (code) => {
    aliveSockets.delete(socket);
    await handleSocketClose({ socketChannel, code });
  });

  socket.on('message', async (raw) => {
    try {
      const message = SocketChannel.parse(raw);

      switch (message.type) {
        case SocketMessageTypes.REG: {
          await handleRegistration({ message, socketChannel });
          break;
        }
        case SocketMessageTypes.CREATE_ROOM: {
          await handleCreateRoom({ socketChannel });
          break;
        }
        case SocketMessageTypes.ADD_USER_TO_ROOM: {
          await handleJoinRoom({ message, socketChannel });
          break;
        }
        case SocketMessageTypes.ADD_SHIPS: {
          await handleAddShips({ message, socketChannel });
          break;
        }
        case SocketMessageTypes.ATTACK: {
          await handleAttack({ message, socketChannel });
          break;
        }
        case SocketMessageTypes.RANDOM_ATTACK: {
          await handleRandomAttack({ message, socketChannel });
          break;
        }
      }
    } catch {
      socket.terminate();
    }
  });
});

httpServer.listen(Env.WS_PORT, () => {
  console.log(`WebSocket server is listening on port: ${Env.WS_PORT}\n`);
});

// Heartbeat check
setInterval(() => {
  wsServer.clients.forEach((socket) => {
    if (!aliveSockets.has(socket)) {
      return socket.terminate();
    }

    aliveSockets.delete(socket);
    socket.ping();
  });
}, STALENESS_CHECK_TIMEOUT);
