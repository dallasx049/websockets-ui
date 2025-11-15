import { PlayersService } from './playersService.ts';
import { RoomsService } from './roomsService.ts';
import { GamesService } from './gamesService.ts';
export { InvalidPasswordError, type IPlayersService, PlayerNotFoundError, } from './playersService.ts';
export { RoomNotFoundError, PlayerAlreadyJoinedRoomError, } from './roomsService.ts';
export { CellAlreadyHitError } from './gamesService.ts';
export declare const players: PlayersService;
export declare const rooms: RoomsService;
export declare const games: GamesService;
//# sourceMappingURL=index.d.ts.map