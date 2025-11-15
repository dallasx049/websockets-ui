import { type ISocketChannel } from '../helpers/index.ts';
type Params = {
    socketChannel: ISocketChannel;
    code: number;
};
export declare const handleSocketClose: ({ socketChannel, code }: Params) => Promise<void>;
export {};
//# sourceMappingURL=handleSocketClose.d.ts.map