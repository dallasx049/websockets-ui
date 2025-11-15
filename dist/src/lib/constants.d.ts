export declare const SocketMessageTypes: {
    readonly REG: "reg";
    readonly CREATE_ROOM: "create_room";
    readonly ADD_USER_TO_ROOM: "add_user_to_room";
    readonly ADD_SHIPS: "add_ships";
    readonly ATTACK: "attack";
    readonly RANDOM_ATTACK: "randomAttack";
};
export declare const ServerMessageTypes: {
    readonly REG: "reg";
    readonly UPDATE_WINNERS: "update_winners";
    readonly UPDATE_ROOM: "update_room";
    readonly CREATE_GAME: "create_game";
    readonly START_GAME: "start_game";
    readonly ATTACK: "attack";
    readonly TURN: "turn";
    readonly FINISH: "finish";
};
export declare const Env: {
    readonly WS_PORT: string | undefined;
    readonly GAME_PORT: string | undefined;
};
export declare const ErrorMessages: {
    readonly INVALID_PASSWORD: "Invalid password";
    readonly PLAYER_NOT_FOUND: "Player not found";
    readonly ROOM_NOT_FOUND: "Room not found";
    readonly SOCKET_NOT_OPEN: "Socket not open";
    readonly INVALID_MESSAGE_FORMAT: "Invalid message format";
    readonly ROOM_ALREADY_OWNED: "Player already created a room";
    readonly PLAYER_ALREADY_JOINED: "Player already joined this room";
    readonly CELL_ALREADY_HIT: "You've already hit this cell";
};
//# sourceMappingURL=constants.d.ts.map