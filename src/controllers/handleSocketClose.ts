import {
  createRoomsUpdatePayload,
  type ISocketChannel,
} from '../helpers/index.ts';
import { players, rooms } from '../models/index.ts';
import { ServerMessageTypes } from '../lib/constants.ts';

type Params = {
  socketChannel: ISocketChannel;
  code: number;
};

export const handleSocketClose = async ({ socketChannel, code }: Params) => {
  const socket = socketChannel.getSocket();
  const player = players.findPlayerBySocket(socketChannel.getSocket());

  if (player) {
    rooms.leaveAllRooms(socket);

    await socketChannel.broadcast({
      type: ServerMessageTypes.UPDATE_ROOM,
      data: createRoomsUpdatePayload(),
    });

    console.log(`--> Player ${player.name} disconnected`);
  } else {
    console.log(`Socket disconnected with ${code} code`);
  }
};
