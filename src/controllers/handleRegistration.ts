import type { RegistrationSocketMessage } from '../lib/types.ts';
import {
  createRoomsUpdatePayload,
  type ISocketChannel,
} from '../helpers/index.ts';
import { ServerMessageTypes } from '../lib/constants.ts';
import { players, InvalidPasswordError } from '../models/index.ts';

export const handleRegistration = async ({
  message,
  socketChannel,
}: {
  message: RegistrationSocketMessage;
  socketChannel: ISocketChannel;
}) => {
  try {
    const player = players.createPlayer(
      socketChannel.getSocket(),
      message.data,
    );
    await socketChannel.send({
      type: ServerMessageTypes.REG,
      data: { name: player.name, index: player.id },
    });
    console.log(`--> Player ${player.name} logged in`);

    await socketChannel.send({
      type: ServerMessageTypes.UPDATE_ROOM,
      data: createRoomsUpdatePayload(),
    });
    console.log(`--> Rooms updated`);

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
  } catch (e) {
    if (e instanceof InvalidPasswordError) {
      const existingPlayer = players.getPlayerByName(message.data.name);
      if (existingPlayer) {
        await socketChannel.send({
          type: ServerMessageTypes.REG,
          data: {
            name: existingPlayer.name,
            index: existingPlayer.id,
            error: true,
            errorText: e.message,
          },
        });
      } else {
        console.log(e.message);
      }
    } else {
      throw new Error();
    }
  }
};
