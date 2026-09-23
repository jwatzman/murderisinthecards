import React from 'react';
import * as z from 'zod/mini';

import type { GameMessage } from '#client/Context';
import {
	GameMessagesContext,
	GameStateContext,
	PlayerIdContext,
	RoomIdContext,
	SendMessageContext,
	YourCardsContext,
} from '#client/Context';
import GamePlay from '#client/GamePlay';
import GameSetup from '#client/GameSetup';
import type { Card } from '#common/cards';
import type { GameState } from '#common/gameState';
import type {
	ClientToServerMessage,
	ServerToClientMessage,
} from '#common/message';
import {
	clientToServerMessageSchema,
	serverToClientMessageSchema,
} from '#common/message';

import '#client/Global.css';

let nextGameMessageId = 0;

function getConnectionURL(): URL {
	const url = new URL(document.location.href);
	url.protocol = url.protocol.replace('http', 'ws');
	if (process.env.NODE_ENV !== 'production') {
		url.port = '2567';
	}

	url.pathname = '/game/play';
	// Keep url.search -- pass through from main page URL!

	return url;
}

function App() {
	const wsRef = React.useRef<WebSocket | null>(null);
	const [cards, setCards] = React.useState<Card[]>([]);
	const [died, setDied] = React.useState(false);
	const [gameMessages, setGameMessages] = React.useState<GameMessage[]>([]);
	const [gameState, setGameState] = React.useState<GameState | null>(null);
	const [roomInfo, setRoomInfo] = React.useState<Extract<
		ServerToClientMessage,
		{ type: 'room_info' }
	> | null>(null);

	React.useEffect(() => {
		if (wsRef.current) {
			return;
		}

		wsRef.current = new WebSocket(getConnectionURL());

		// eslint-disable-next-line @eslint-react/web-api-no-leaked-event-listener
		wsRef.current.addEventListener('message', (m) => {
			let parsed: ServerToClientMessage;
			try {
				parsed = serverToClientMessageSchema.parse(
					JSON.parse(m.data as string),
				);
			} catch (e) {
				console.error('Invalid message', e, m.data);
				return;
			}

			switch (parsed.type) {
				case 'room_info':
					setRoomInfo(parsed);
					break;
				case 'game_state':
					setGameState(parsed.state);
					break;
				case 'game_message': {
					const message = parsed.message;
					setGameMessages((oldMessages) => {
						const newMessage = {
							message,
							id: nextGameMessageId++,
						};
						const newMessages = oldMessages.concat(newMessage);
						while (newMessages.length > 10) {
							newMessages.shift();
						}
						return newMessages;
					});
					break;
				}
				case 'your_cards':
					setCards(parsed.cards);
					break;
				case 'error':
					window.alert(parsed.err);
					break;
				default: {
					const _: never = parsed;
				}
			}
		});
		// eslint-disable-next-line @eslint-react/web-api-no-leaked-event-listener
		wsRef.current.addEventListener('error', (e) => {
			console.error('WebSocket error', e);
			setDied(true);
		});
		// eslint-disable-next-line @eslint-react/web-api-no-leaked-event-listener
		wsRef.current.addEventListener('close', () => {
			setDied(true);
		});
	}, []);

	const sendMessage = React.useCallback((m: ClientToServerMessage) => {
		const ws = wsRef.current;
		if (!ws) {
			console.error('sendMessage on null ws?!');
			return;
		}

		ws.send(JSON.stringify(z.encode(clientToServerMessageSchema, m)));
	}, []);

	React.useEffect(() => {
		if (!roomInfo || !gameState?.phase) {
			return;
		}

		const newSearch = new URLSearchParams();
		if (gameState.phase !== 'GAME_OVER') {
			newSearch.set('r', roomInfo.room);

			if (gameState.phase !== 'SETUP') {
				newSearch.set('t', roomInfo.reconnectToken);
			}
		}

		const newUrl = new URL(document.location.href);
		newUrl.search = newSearch.toString();

		history.replaceState(null, '', newUrl);
	}, [gameState?.phase, roomInfo]);

	if (died) {
		return <Disconnected />;
	}

	if (!roomInfo || !gameState) {
		return <div>Connecting...</div>;
	}

	return (
		<SendMessageContext value={sendMessage}>
			<PlayerIdContext value={roomInfo.player}>
				<RoomIdContext value={roomInfo.room}>
					<YourCardsContext value={cards}>
						<GameMessagesContext value={gameMessages}>
							<GameStateContext value={gameState}>
								<Game />
							</GameStateContext>
						</GameMessagesContext>
					</YourCardsContext>
				</RoomIdContext>
			</PlayerIdContext>
		</SendMessageContext>
	);
}

function Game() {
	const phase = React.use(GameStateContext).phase;

	React.useEffect(() => {
		if (phase === 'GAME_OVER') {
			// Try to be nice and dump localStorage when we know we don't need any
			// more of its data. This isn't needed for correctness -- the rest of the
			// client deals with stale data, which can happen e.g. after a disconnect
			// -- doesn't prevent anything from setting data even after the game
			// ended (Notes, in particular)... but is nice anyway.
			localStorage.clear();
		}
	});

	switch (phase) {
		case 'SETUP':
			return <GameSetup />;
		default:
			return <GamePlay />;
	}
}

function Disconnected() {
	const onClick = () => window.location.reload();
	return (
		<div>
			Disconnected. <button onClick={onClick}>Reload?</button>
		</div>
	);
}

export default App;
