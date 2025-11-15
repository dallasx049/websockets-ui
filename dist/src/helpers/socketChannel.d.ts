import { WebSocket, type WebSocketServer } from 'ws';
import type { ServerMessage, SocketMessage } from '../lib/types.ts';
type BroadcastOptions = {
    excludeSelf?: boolean;
    clients?: WebSocket[];
};
type SendOptions = {
    socket?: WebSocket;
};
type Message = Omit<ServerMessage, 'id'>;
export interface ISocketChannel {
    getSocket: () => WebSocket;
    send: <T extends Message>(message: T, options?: SendOptions) => Promise<void>;
    broadcast: <T extends Message>(message: T, options?: BroadcastOptions) => Promise<void>;
}
export declare class SocketNotOpenError extends Error {
    constructor(message?: "Socket not open");
}
export declare class InvalidMessageFormatError extends Error {
    constructor(message?: "Invalid message format");
}
export declare class SocketChannel implements ISocketChannel {
    private server;
    private socket;
    constructor(socket: WebSocket, server: WebSocketServer);
    getSocket(): WebSocket;
    send<T extends Message>(message: T, options?: SendOptions): Promise<void>;
    broadcast<T extends Message>(message: T, options?: BroadcastOptions): Promise<void>;
    static parse(raw: WebSocket.RawData): SocketMessage;
}
export {};
//# sourceMappingURL=socketChannel.d.ts.map