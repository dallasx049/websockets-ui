export const SocketMessageTypes = {
  REG: 'reg',
  CREATE_ROOM: 'create_room',
  ADD_USER_TO_ROOM: 'add_user_to_room',
} as const;

export const ServerMessageTypes = {
  REG: 'reg',
  UPDATE_WINNERS: 'update_winners',
  UPDATE_ROOM: 'update_room',
  CREATE_GAME: 'create_game',
} as const;

export const Env = {
  WS_PORT: process.env.WS_PORT,
  GAME_PORT: process.env.GAME_PORT,
} as const;

export const ErrorMessages = {
  ROOM_ALREADY_EXISTS: 'Room already exist',
  ROOM_NOT_FOUND: 'Room not found',
  PLAYER_ALREADY_EXISTS: 'Player already exists',
  PLAYER_NOT_EXISTS: 'Player not exists',
  SOCKET_NOT_OPEN: 'Socket not open',
  INVALID_MESSAGE_FORMAT: 'Invalid socket message format',
  PLAYER_ALREADY_IN_ROOM: 'Player already in room',
  PLAYER_NOT_IN_ROOM: 'Player not in room',
} as const;
