import type { AttackSocketMessage } from '../lib/types.ts';
import type { ISocketChannel } from '../helpers/index.ts';
import { games } from '../models/index.ts';
import { ServerMessageTypes } from '../lib/constants.ts';

export const handleAttack = async ({
  message,
  socketChannel,
}: {
  message: AttackSocketMessage;
  socketChannel: ISocketChannel;
}) => {
  try {
    const { gameId, indexPlayer, x, y } = message.data;

    const feedback = games.attack(gameId, indexPlayer, x, y);
    if (!feedback) return;

    const { playerName, status, position } = feedback;

    await socketChannel.send({
      type: ServerMessageTypes.ATTACK,
      data: {
        currentPlayer: playerName,
        status,
        position,
      },
    });
  } catch (e) {
    console.log(e);
  }
};
