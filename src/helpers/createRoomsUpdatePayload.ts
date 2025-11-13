import { players, rooms } from '../models/index.ts';

export const createRoomsUpdatePayload = () => {
  return rooms.getRooms('open').map((room) => ({
    roomId: room.id,
    roomUsers: [...room.players]
      .map((name) => {
        const player = players.getPlayerByName(name);
        if (player) {
          return { name: player.name, index: player.id };
        }
        return null;
      })
      .filter((player) => player !== null),
  }));
};
