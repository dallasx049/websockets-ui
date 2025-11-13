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

    const { currentPlayer, roomPlayers } = roomRes;
    const clients = roomPlayers
      .map((name) => players.getPlayerByName(name)?.socket)
      .filter((socket) => socket !== undefined);

    await socketChannel.broadcast(
      {
        type: ServerMessageTypes.CREATE_GAME,
        data: {
          idGame: '1', // TODO: add game service logic
          idPlayer: currentPlayer,
        },
      },
      { clients },
    );

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
