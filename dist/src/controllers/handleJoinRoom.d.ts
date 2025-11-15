import type { AddPlayerToRoomSocketMessage } from '../lib/types.ts';
import { type ISocketChannel } from '../helpers/index.ts';
type Params = {
    message: AddPlayerToRoomSocketMessage;
    socketChannel: ISocketChannel;
};
export declare const handleJoinRoom: ({ message, socketChannel }: Params) => Promise<void>;
export {};
//# sourceMappingURL=handleJoinRoom.d.ts.map