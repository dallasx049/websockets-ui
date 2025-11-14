import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

import { Env, SocketMessageTypes } from './lib/constants.ts';
import { SocketChannel } from './helpers/index.ts';
import {
  handleRegistration,
  handleCreateRoom,
  handleSocketClose,
  handleJoinRoom,
  handleAddShips,
} from './controllers/index.ts';

const httpServer = createServer();
const wsServer = new WebSocketServer({ server: httpServer });

wsServer.on('connection', (socket) => {
  const socketChannel = new SocketChannel(socket, wsServer);

  console.log('Socket connected to the server');

  socket.on('error', (e) => {
    console.error('Socket error: ', e);
    socket.close();
  });

  socket.on('close', async (code) => {
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
      }
    } catch {
      socket.close();
    }
  });
});

httpServer.listen(Env.WS_PORT, () => {
  console.log(`WebSocket server is listening on port: ${Env.WS_PORT}\n`);
});
