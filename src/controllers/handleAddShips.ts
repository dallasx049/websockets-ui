import type { AddShipsSocketMessage } from '../lib/types.ts';
import type { ISocketChannel } from '../helpers/index.ts';
import { games, players } from '../models/index.ts';

export const handleAddShips = async ({
  message,
  socketChannel,
}: {
  message: AddShipsSocketMessage;
  socketChannel: ISocketChannel;
}) => {
  const player = players.findPlayerBySocket(socketChannel.getSocket());
  if (!player) return;

  const { gameId, ships } = message.data;

  games.addShips(gameId, player.name, ships);
};
