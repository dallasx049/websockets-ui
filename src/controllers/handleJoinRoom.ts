import type { AddPlayerToRoomSocketMessage } from '../lib/types.ts';
import {
  createRoomsUpdatePayload,
  type ISocketChannel,
} from '../helpers/index.ts';
import { ServerMessageTypes } from '../lib/constants.ts';
import {
  rooms,
  RoomNotFoundError,
  PlayerAlreadyJoinedRoomError,
  players,
  games,
} from '../models/index.ts';

type Params = {
  message: AddPlayerToRoomSocketMessage;
  socketChannel: ISocketChannel;
};

export const handleJoinRoom = async ({ message, socketChannel }: Params) => {
  try {
    const socket = socketChannel.getSocket();
    const roomRes = rooms.joinRoom(message.data.indexRoom, socket);
    console.log(`--> User joined the room`);

    await socketChannel.broadcast({
      type: ServerMessageTypes.UPDATE_ROOM,
      data: createRoomsUpdatePayload(),
    });
    console.log(`--> Rooms updated`);

    if (!roomRes) return;

    const { roomPlayers } = roomRes;
    const clients = roomPlayers
      .map((name) => players.getPlayerByName(name))
      .filter((socket) => socket !== undefined);

    const game = games.createGame(
      message.data.indexRoom,
      roomPlayers,
      async (gameId, _players) => {
        const rnd = Math.random();
        const playerToAttack = rnd < 0.5 ? _players[0].name : _players[1].name;

        for (const player of _players) {
          const socket = players.getPlayerByName(player.name)?.socket;
          if (!socket) continue;

          await socketChannel.send(
            {
              type: ServerMessageTypes.START_GAME,
              data: {
                ships: player.ships,
                currentPlayerIndex: player.name,
              },
            },
            { socket },
          );

          await socketChannel.send(
            {
              type: ServerMessageTypes.TURN,
              data: {
                currentPlayer: playerToAttack,
              },
            },
            { socket },
          );
        }

        games.switchTurn(gameId, playerToAttack);

        console.log('--> Game started');
        console.log(`--> ${playerToAttack} turn`);
      },
      async (winnerName, loserName) => {
        const clients = [winnerName, loserName]
          .map((name) => players.getPlayerByName(name)?.socket)
          .filter((socket) => socket !== undefined);

        await socketChannel.broadcast(
          {
            type: ServerMessageTypes.FINISH,
            data: {
              winPlayer: winnerName,
            },
          },
          { clients },
        );

        players.increaseScore(winnerName);

        console.log(`--> ${winnerName} won the game`);

        const leaderboardPayload = players
          .getAllPlayers()
          .map(({ name, score }) => ({
            name,
            wins: score,
          }));
        await socketChannel.broadcast({
          type: ServerMessageTypes.UPDATE_WINNERS,
          data: leaderboardPayload,
        });
        console.log(`--> Leaderboard updated`);
      },
    );

    for (const { socket, name } of clients) {
      await socketChannel.send(
        {
          type: ServerMessageTypes.CREATE_GAME,
          data: {
            idGame: game.id,
            idPlayer: name,
          },
        },
        { socket },
      );
    }

    console.log(`--> Game created`);
  } catch (e) {
    if (
      e instanceof RoomNotFoundError ||
      e instanceof PlayerAlreadyJoinedRoomError
    ) {
      console.log(e.message);
    } else {
      console.error('Failed to join room');
    }
  }
};
