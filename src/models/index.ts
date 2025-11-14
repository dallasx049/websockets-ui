import { PlayersService } from './playersService.ts';
import { RoomsService } from './roomsService.ts';
import { GamesService } from './gamesService.ts';

export {
  InvalidPasswordError,
  type IPlayersService,
  PlayerNotFoundError,
} from './playersService.ts';

export {
  RoomNotFoundError,
  PlayerAlreadyJoinedRoomError,
} from './roomsService.ts';

// Export an instance of service to act as distributed DB with single source
export const players = new PlayersService();
export const rooms = new RoomsService(players);
export const games = new GamesService();
