export const SocketMessageTypes = {
  REG: 'reg',
  CREATE_ROOM: 'create_room',
  ADD_USER_TO_ROOM: 'add_user_to_room',
  ADD_SHIPS: 'add_ships',
  ATTACK: 'attack',
  RANDOM_ATTACK: 'randomAttack',
} as const;

export const ServerMessageTypes = {
  REG: 'reg',
  UPDATE_WINNERS: 'update_winners',
  UPDATE_ROOM: 'update_room',
  CREATE_GAME: 'create_game',
  START_GAME: 'start_game',
  ATTACK: 'attack',
  TURN: 'turn',
} as const;

export const Env = {
  WS_PORT: process.env.WS_PORT,
  GAME_PORT: process.env.GAME_PORT,
} as const;

export const ErrorMessages = {
  INVALID_PASSWORD: 'Invalid password',
  PLAYER_NOT_FOUND: 'Player not found',
  ROOM_NOT_FOUND: 'Room not found',
  SOCKET_NOT_OPEN: 'Socket not open',
  INVALID_MESSAGE_FORMAT: 'Invalid message format',
  ROOM_ALREADY_OWNED: 'Player already created a room',
  PLAYER_ALREADY_JOINED: 'Player already joined this room',
  CELL_ALREADY_HIT: "You've already hit this cell",
} as const;
