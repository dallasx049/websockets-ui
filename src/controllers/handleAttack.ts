import type { AttackSocketMessage } from '../lib/types.ts';
import type { ISocketChannel } from '../helpers/index.ts';
import { games, players, CellAlreadyHitError } from '../models/index.ts';
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
