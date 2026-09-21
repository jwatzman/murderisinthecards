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

import type { GameRoom } from './GameRoom';

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
	#game: GameRoom;

	readonly id: string;
	state: PlayerState;
	cards: Card[];

	constructor(ws: WebSocket, game: GameRoom, id: string) {
		this.#ws = ws;
		this.#game = game;

		this.id = id;
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

		// TODO: set up ping/pong.

		this.#ws.on('message', (data) => {
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

		this.#ws.on('error', (_err) => {
			this.#onClose();
		});

		this.#ws.on('close', () => {
			this.#onClose();
		});
	}

	sendMessage(message: ServerToClientMessage) {
		this.#ws?.send(
			JSON.stringify(z.encode(serverToClientMessageSchema, message)),
			(err) => {
				if (err) {
					this.#onClose();
				}
			},
		);
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

	#onClose() {
		if (!this.#ws) {
			return;
		}

		// TODO: allow reconnection.
		this.#ws.terminate();
		this.#ws = null;
		this.#game.playerDisconnected(this);
	}
}
