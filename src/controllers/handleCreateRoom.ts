import {
  createRoomsUpdatePayload,
  type ISocketChannel,
} from '../helpers/index.ts';
import { ServerMessageTypes } from '../lib/constants.ts';
import { PlayerNotFoundError, rooms } from '../models/index.ts';

export const handleCreateRoom = async ({
  socketChannel,
}: {
  socketChannel: ISocketChannel;
}) => {
  try {
    rooms.createRoom(socketChannel.getSocket());
    console.log(`--> Room created`);

    await socketChannel.broadcast({
      type: ServerMessageTypes.UPDATE_ROOM,
      data: createRoomsUpdatePayload(),
    });
    console.log(`--> Rooms updated`);
  } catch (e) {
    if (e instanceof PlayerNotFoundError) {
      console.log(e.message);
    } else {
      throw new Error();
    }
  }
};
