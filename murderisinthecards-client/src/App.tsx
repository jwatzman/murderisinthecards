import * as Colyseus from 'colyseus.js';
import React from 'react';

import {
	Card,
	ClientToServerMessage,
	PlayPhase,
	ServerToClientMessage,
} from 'murderisinthecards-common/Consts';
import { ConstGameState } from 'murderisinthecards-common/ConstGameState';

import {
	GameMessage,
	GameMessagesContext,
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
	YourCardsContext,
} from './Context';
import GameSetup from './GameSetup';
import GamePlay from './GamePlay';

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

	return `${protocol}//${host}${port}`;
}

function App() {
	const [cards, setCards] = React.useState<Card[]>([]);
	const [gameMessages, setGameMessages] = React.useState<GameMessage[]>([]);
	const [gameState, setGameState] = React.useState<ConstGameState | null>(null);
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [sessionId, setSessionId] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (room) {
			return;
		}

		const connectionSuccess = (room: Colyseus.Room) => {
			setRoom(room);
			setSessionId(room.sessionId);

			localStorage.setItem(ROOM_ID_LOCALSTORAGE_ID, room.id);
			localStorage.setItem(SESSION_ID_LOCALSTORAGE_KEY, room.sessionId);
		};

		const createNewRoom = () =>
			client.joinOrCreate('murder').then(connectionSuccess);

		const client = new Colyseus.Client(getConnectionURL());

		const savedRoomId = localStorage.getItem(ROOM_ID_LOCALSTORAGE_ID);
		const savedSessionId = localStorage.getItem(SESSION_ID_LOCALSTORAGE_KEY);

		if (savedRoomId && savedSessionId) {
			client.reconnect(savedRoomId, savedSessionId)
				.then(connectionSuccess)
				.catch(createNewRoom);
		} else {
			createNewRoom();
		}
	}, [room]);

	React.useEffect(() => {
		if (!room) {
			return;
		}

		room.onStateChange((newState) => {
			(window as any).debugGameState = newState;
			setGameState(Object.assign({}, newState)); // XXX should be deep copy
		});

		room.onMessage(ServerToClientMessage.GAME_MESSAGE, message => {
			setGameMessages(oldMessages => {
				const newMessage = {message, id: nextGameMessageId++};
				const newMessages = oldMessages.concat(newMessage);
				while (newMessages.length > 10) {
					newMessages.shift();
				}
				return newMessages;
			});
		});

		room.onMessage(ServerToClientMessage.YOUR_CARDS, cards => {
			setCards(cards);
		});

		room.onError((_, message) => {
			window.alert(message);
		});
	}, [room]);

	if (!room || !gameState) {
		return <div>Connecting...</div>;
	}

	const sendMessage = (type: ClientToServerMessage, message: any) =>
		room.send(type, message);

	return (
		<SendMessageContext.Provider value={sendMessage}>
			<SessionIdContext.Provider value={sessionId!}>
				<YourCardsContext.Provider value={cards}>
					<GameMessagesContext.Provider value={gameMessages}>
						<GameStateContext.Provider value={gameState}>
							<Game />
						</GameStateContext.Provider>
					</GameMessagesContext.Provider>
				</YourCardsContext.Provider>
			</SessionIdContext.Provider>
		</SendMessageContext.Provider>
	);
}

function Game() {
	const phase = React.useContext(GameStateContext).phase;
	switch (phase) {
		case PlayPhase.SETUP:
			return <GameSetup />;
		default:
			return <GamePlay />;
	}
}

export default App;
