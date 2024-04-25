interface WebSocketConstructor {
	new (options: WebSocket.WebSocketOptions): WebSocket.WebSocket;
}

declare const WebSocket: WebSocketConstructor;

declare namespace WebSocket {
	export interface WebSocketOptions {
		url: string;
		batchMs?: number;
		endpoint?: string;
		auth?: string;
	}

	export interface WebSocket {
		connected: boolean;
		connect(): LuaTuple<[true, undefined] | [false, string]>;
		send(data: unknown): boolean;
		close(code?: number, reason?: string): boolean;
		onMessaged(callback: (value: string) => void): void;
		onClosed(callback: (code: number, reason: string) => void): void;
	}
}

export = WebSocket;
