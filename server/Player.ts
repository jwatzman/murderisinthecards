import type { RawData, WebSocket } from 'ws';
import * as z from 'zod/mini';

import type { Card } from '#common/cards';
import type { PlayerState } from '#common/gameState';
import type {
	ClientToServerMessage,
	ServerToClientMessage,
} from '#common/message';
import {
	clientToServerMessageSchema,
	serverToClientMessageSchema,
} from '#common/message';
import type { GameRoom } from '#server/GameRoom';
import { newId } from '#server/newId';

const PING_INTERVAL_MS = 2000;

function webSocketDataToString(data: RawData): string {
	if (Buffer.isBuffer(data)) {
		return data.toString();
	} else if (Array.isArray(data)) {
		return Buffer.concat(data).toString();
	} else {
		return Buffer.from(data).toString();
	}
}

export class Player {
	#ws: WebSocket | null;
	readonly #game: GameRoom;

	readonly id: string;
	readonly reconnectToken: string;
	state: PlayerState;
	cards: Card[];

	constructor(ws: WebSocket, game: GameRoom) {
		this.#ws = null;
		this.#game = game;

		this.id = newId();
		this.reconnectToken = newId();
		this.state = {
			suspect: null,
			name: '',
			eliminated: false,
			x: 0,
			y: 0,
			room: null,
			teleported: false,
		};

		this.cards = [];

		this.setWebSocket(ws);
	}

	setWebSocket(ws: WebSocket) {
		this.#ws?.terminate();

		ws.on('message', (data) => {
			let parsed: ClientToServerMessage;
			try {
				parsed = clientToServerMessageSchema.parse(
					JSON.parse(webSocketDataToString(data)),
				);
			} catch (_) {
				this.sendErrorMessage('Invalid WebSocket message');
				return;
			}

			this.#game.processMessage(this, parsed);
		});

		let isAlive = true;
		ws.on('pong', () => (isAlive = true));
		const interval = setInterval(() => {
			if (!isAlive) {
				ws.terminate();
				return;
			}

			isAlive = false;
			ws.ping();
		}, PING_INTERVAL_MS);

		ws.on('error', (_err) => {
			ws.terminate();
		});

		ws.on('close', () => {
			clearInterval(interval);
			ws.terminate();

			if (this.#ws === ws) {
				this.#ws = null;
				this.#game.playerDisconnected(this);
			}
		});

		this.#ws = ws;
	}

	sendMessage(message: ServerToClientMessage) {
		// The socket may change between the send and the error callback; close over
		// it in case.
		const ws = this.#ws;

		ws?.send(
			JSON.stringify(z.encode(serverToClientMessageSchema, message)),
			(err) => {
				if (err) {
					ws?.terminate();
				}
			},
		);
	}

	sendRoomInfo() {
		this.sendMessage({
			type: 'room_info',
			room: this.#game.id,
			player: this.id,
			reconnectToken: this.reconnectToken,
		});
	}

	sendCards() {
		this.sendMessage({ type: 'your_cards', cards: this.cards });
	}

	sendErrorMessage(err: string) {
		this.sendMessage({ type: 'error', err });
	}

	isConnected() {
		return this.#ws !== null;
	}
}
