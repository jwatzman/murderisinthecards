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

let nextGameMessageId = 0;

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

		const client = new Colyseus.Client('ws://localhost:2567');
		client.joinOrCreate('my_room').then(room => {
			setRoom(room);
			setSessionId(room.sessionId);
		});
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
