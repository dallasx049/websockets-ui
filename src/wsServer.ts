import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

import {
  Env,
  ServerMessageTypes,
  SocketMessageTypes,
} from './lib/constants.ts';
import {
  PlayerAlreadyExistsError,
  PlayerNotExistsError,
  PlayersService,
} from './models/playersService.ts';
import { SocketChannel } from './models/socketChanel.ts';
import {
  RoomAlreadyExistsError,
  RoomNotFoundError,
  RoomsService,
} from './models/roomsService.ts';

const httpServer = createServer();
const wsServer = new WebSocketServer({ server: httpServer });

const players = new PlayersService();
const rooms = new RoomsService(players);

wsServer.on('connection', (socket) => {
  const socketChannel = new SocketChannel(socket, wsServer);

  console.log('Socket connected to the server');

  socket.on('error', (err) => {
    console.error('Socket error: ', err);
    socket.close();
  });

  socket.on('close', async (code) => {
    const removedPlayer = players.removePlayer(socket);

    if (removedPlayer) {
      await socketChannel.broadcast({
        type: ServerMessageTypes.UPDATE_WINNERS,
        data: players.getAllPlayers(),
      });
      console.log(`--> Player ${removedPlayer.name} left the game`);
      console.log(`--> Scoreboard updated`);
    }

    console.log(`Socket closed with ${code} code`);
  });

  socket.on('message', async (raw) => {
    try {
      const message = SocketChannel.parse(raw);

      switch (message.type) {
        case SocketMessageTypes.REG: {
          const player = players.createPlayer(socket, message.data);

          await socketChannel.send({
            type: ServerMessageTypes.REG,
            data: player,
          });

          console.log(`--> Player ${player.name} registered`);

          await socketChannel.send({
            type: ServerMessageTypes.UPDATE_ROOM,
            data: rooms.getSerialized(),
          });

          console.log(`--> Rooms updated`);

          await socketChannel.broadcast({
            type: ServerMessageTypes.UPDATE_WINNERS,
            data: players.getAllPlayers(),
          });

          console.log(`--> Scoreboard updated`);

          break;
        }

        case SocketMessageTypes.CREATE_ROOM: {
          const { roomId } = rooms.createRoom(socket);
          rooms.addPlayer(roomId, socket);

          console.log(`--> Room created`);

          await socketChannel.broadcast({
            type: ServerMessageTypes.UPDATE_ROOM,
            data: rooms.serialize(),
          });

          console.log(`--> Rooms updated`);

          break;
        }
      }
    } catch (e) {
      if (e instanceof RoomNotFoundError) {
        console.log(e.message);
      } else if (e instanceof RoomAlreadyExistsError) {
        console.log(e.message);
      } else if (e instanceof PlayerAlreadyExistsError) {
        console.log(e.message);
      } else if (e instanceof PlayerNotExistsError) {
        console.log(e.message);
      } else {
        socket.close();
      }
    }
  });
});

httpServer.listen(Env.WS_PORT, () => {
  console.log(`WebSocket server is listening on port: ${Env.WS_PORT}\n`);
});
