import * as Colyseus from '@colyseus/sdk';
import React from 'react';

import type { GameMessage } from '#client/Context';
import {
	GameMessagesContext,
	GameStateContext,
	RoomIdContext,
	SendMessageContext,
	SessionIdContext,
	YourCardsContext,
} from '#client/Context';
import GamePlay from '#client/GamePlay';
import GameSetup from '#client/GameSetup';
import type { ConstGameState } from '#common/ConstGameState';
import type { Card, ClientToServerMessage } from '#common/Consts';
import { PlayPhase, ServerToClientMessage } from '#common/Consts';

import './Global.css';

const RECONNECTION_TOKEN_LOCALSTORAGE_KEY = 'reconnectionToken';

let nextGameMessageId = 0;

// Colyseus mutates a single state object in place, so there is never a new
// reference to hand React, and the sync'd fields are accessors on the schema
// prototype rather than own properties, so spreading one yields an empty
// object. toJSON() gives us a fresh deep copy of just the sync'd fields each
// time -- it renders ArraySchema as a plain array, but MapSchema as a plain
// object, so the players need rebuilding into a real Map.
function snapshotGameState(state: any): ConstGameState {
	const { players, ...rest } = state.toJSON();
	return {
		...rest,
		players: new Map(Object.entries(players)),
	} as ConstGameState;
}

function getConnectionURL() {
	const location = document.location;
	const protocol = location.protocol.replace('http', 'ws');
	const host = location.host.replace(/:.*/, '');

	let port = '';
	if (process.env.NODE_ENV === 'production') {
		if (location.port) {
			port = ':' + location.port;
		}
	} else {
		port = ':2567';
	}

	return `${protocol}//${host}${port}/game`;
}

function App() {
	const connectionInitalizedRef = React.useRef(false);
	const [cards, setCards] = React.useState<Card[]>([]);
	const [died, setDied] = React.useState(false);
	const [gameMessages, setGameMessages] = React.useState<GameMessage[]>([]);
	const [gameState, setGameState] = React.useState<ConstGameState | null>(null);
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [roomId, setRoomId] = React.useState<string | null>(null);
	const [sessionId, setSessionId] = React.useState<string | null>(null);

	const sendMessage = React.useCallback(
		(type: ClientToServerMessage, message: any) =>
			room && room.send(type, message),
		[room],
	);

	const connectionSuccess = (room: Colyseus.Room) => {
		setRoom(room);
		setRoomId(room.roomId);
		setSessionId(room.sessionId);

		// Re-issued on every join, including reconnects, so this needs to be
		// saved on every successful connection, not just the first.
		localStorage.setItem(
			RECONNECTION_TOKEN_LOCALSTORAGE_KEY,
			room.reconnectionToken,
		);

		(window as any).debugRoom = room;

		room.onStateChange((newState) => {
			(window as any).debugGameState = newState;
			setGameState(snapshotGameState(newState));
		});

		room.onLeave((_code) => {
			setDied(true);
		});

		room.onMessage(ServerToClientMessage.GAME_MESSAGE, (message) => {
			setGameMessages((oldMessages) => {
				const newMessage = { message, id: nextGameMessageId++ };
				const newMessages = oldMessages.concat(newMessage);
				while (newMessages.length > 10) {
					newMessages.shift();
				}
				return newMessages;
			});
		});

		room.onMessage(ServerToClientMessage.YOUR_CARDS, (cards) => {
			setCards(cards);
		});

		room.onError((_, message) => {
			window.alert(message);
		});
	};

	React.useEffect(() => {
		if (connectionInitalizedRef.current) {
			return;
		}

		// There *has* to be a better way to build this up.
		const client = new Colyseus.Client(getConnectionURL());

		const createNewRoom = () =>
			void client.create('murder').then(connectionSuccess);

		const joinSpecifiedRoom = () => {
			const specifiedRoomId = new URL(
				window.location.toString(),
			).searchParams.get('r');
			if (specifiedRoomId) {
				client
					.joinById(specifiedRoomId)
					.then(connectionSuccess)
					.catch(createNewRoom);
			} else {
				createNewRoom();
			}
		};

		const joinSavedRoom = () => {
			const savedToken = localStorage.getItem(
				RECONNECTION_TOKEN_LOCALSTORAGE_KEY,
			);

			if (savedToken) {
				client
					.reconnect(savedToken)
					.then(connectionSuccess)
					.catch(joinSpecifiedRoom);
			} else {
				joinSpecifiedRoom();
			}
		};

		joinSavedRoom();
		connectionInitalizedRef.current = true;
	}, []);

	if (!room || !gameState) {
		return <div>Connecting...</div>;
	}

	if (died) {
		return <Disconnected />;
	}

	return (
		<SendMessageContext value={sendMessage}>
			<SessionIdContext value={sessionId!}>
				<RoomIdContext value={roomId!}>
					<YourCardsContext value={cards}>
						<GameMessagesContext value={gameMessages}>
							<GameStateContext value={gameState}>
								<Game />
							</GameStateContext>
						</GameMessagesContext>
					</YourCardsContext>
				</RoomIdContext>
			</SessionIdContext>
		</SendMessageContext>
	);
}

function Game() {
	const phase = React.use(GameStateContext).phase;

	React.useEffect(() => {
		if (phase === PlayPhase.GAME_OVER) {
			// Try to be nice and dump localStorage when we know we don't need any
			// more of its data. This isn't needed for correctness -- the rest of the
			// client deals with stale data, which can happen e.g. after a disconnect
			// -- doesn't prevent anything from setting data even after the game
			// ended (Notes, in particular)... but is nice anyway.
			localStorage.clear();
		}
	});

	switch (phase) {
		case PlayPhase.SETUP:
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
