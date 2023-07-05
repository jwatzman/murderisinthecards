import * as Colyseus from 'colyseus.js';
import React from 'react';
import { injectGlobal } from '@emotion/css';

import {
	Card,
	ClientToServerMessage,
	PlayPhase,
	ServerToClientMessage,
} from 'common/Consts';
import { ConstGameState } from 'common/ConstGameState';

import {
	GameMessage,
	GameMessagesContext,
	GameStateContext,
	RoomIdContext,
	SendMessageContext,
	SessionIdContext,
	YourCardsContext,
} from './Context';
import GameSetup from './GameSetup';
import GamePlay from './GamePlay';

injectGlobal({
	body: {
		margin: 0,
	},
});

const ROOM_ID_LOCALSTORAGE_ID = 'roomId';
const SESSION_ID_LOCALSTORAGE_KEY = 'sessionId';

let nextGameMessageId = 0;

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
	const connectionInitalized = React.useRef(false);
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
		setRoomId(room.id);
		setSessionId(room.sessionId);

		localStorage.setItem(ROOM_ID_LOCALSTORAGE_ID, room.id);
		localStorage.setItem(SESSION_ID_LOCALSTORAGE_KEY, room.sessionId);

		(window as any).debugRoom = room;

		room.onStateChange((newState) => {
			(window as any).debugGameState = newState;
			setGameState(Object.assign({}, newState)); // XXX should be deep copy
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
		if (connectionInitalized.current) {
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
			const savedRoomId = localStorage.getItem(ROOM_ID_LOCALSTORAGE_ID);
			const savedSessionId = localStorage.getItem(SESSION_ID_LOCALSTORAGE_KEY);

			if (savedRoomId && savedSessionId) {
				client
					.reconnect(savedRoomId, savedSessionId)
					.then(connectionSuccess)
					.catch(joinSpecifiedRoom);
			} else {
				joinSpecifiedRoom();
			}
		};

		joinSavedRoom();
		connectionInitalized.current = true;
	}, []);

	if (!room || !gameState) {
		return <div>Connecting...</div>;
	}

	if (died) {
		return <Disconnected />;
	}

	return (
		<SendMessageContext.Provider value={sendMessage}>
			<SessionIdContext.Provider value={sessionId!}>
				<RoomIdContext.Provider value={roomId!}>
					<YourCardsContext.Provider value={cards}>
						<GameMessagesContext.Provider value={gameMessages}>
							<GameStateContext.Provider value={gameState}>
								<Game />
							</GameStateContext.Provider>
						</GameMessagesContext.Provider>
					</YourCardsContext.Provider>
				</RoomIdContext.Provider>
			</SessionIdContext.Provider>
		</SendMessageContext.Provider>
	);
}

function Game() {
	const phase = React.useContext(GameStateContext).phase;

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
