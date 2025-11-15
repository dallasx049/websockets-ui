import type { RandomAttackSocketMessage } from '../lib/types.ts';
import { type ISocketChannel } from '../helpers/index.ts';
import { CellAlreadyHitError, games, players } from '../models/index.ts';
import { ServerMessageTypes } from '../lib/constants.ts';

export const handleRandomAttack = async ({
  message,
  socketChannel,
}: {
  message: RandomAttackSocketMessage;
  socketChannel: ISocketChannel;
}) => {
  try {
    const { gameId, indexPlayer } = message.data;

    const feedback = games.randomAttack(gameId, indexPlayer);
    if (!feedback) return;

    const { playerName, enemyName, status, position, attackTurnPlayerName } =
      feedback;

    await socketChannel.send({
      type: ServerMessageTypes.ATTACK,
      data: {
        currentPlayer: playerName,
        status,
        position,
      },
    });

    for (const name of [playerName, enemyName]) {
      const player = players.getPlayerByName(name);

      if (player) {
        await socketChannel.send(
          {
            type: ServerMessageTypes.TURN,
            data: {
              currentPlayer: attackTurnPlayerName,
            },
          },
          { socket: player.socket },
        );
      }
    }
  } catch (e) {
    if (e instanceof CellAlreadyHitError) {
      console.log(e.message);
    } else {
      throw new Error();
    }
  }
};
