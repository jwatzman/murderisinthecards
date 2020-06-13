import * as Colyseus from 'colyseus.js';
import React from 'react';

import {
	ClientToServerMessage,
	PlayPhase,
	ServerToClientMessage,
} from 'murderisinthecards-common/Consts';
import { ConstGameState } from 'murderisinthecards-common/ConstGameState';

import {
	GameMessagesContext,
	GameStateContext,
	SecretStateContext,
	SendMessageContext,
} from './Context';
import GameSetup from './GameSetup';
import GamePlay from './GamePlay';

function App() {
	const [gameMessages, setGameMessages] = React.useState<string[]>([]);
	const [gameState, setGameState] = React.useState<ConstGameState | null>(null);
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [secretState, setSecretState] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (room) {
			return;
		}

		const client = new Colyseus.Client('ws://localhost:2567');
		client.joinOrCreate('my_room').then(room => {
			setRoom(room);
			setSecretState(room.sessionId); // TODO figure out lifecycle for this
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
				const newMessages = oldMessages.concat([message]);
				while (newMessages.length > 10) {
					newMessages.shift();
				}
				return newMessages;
			});
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
			<SecretStateContext.Provider value={secretState!}>
				<GameMessagesContext.Provider value={gameMessages}>
					<GameStateContext.Provider value={gameState}>
						<Game />
					</GameStateContext.Provider>
				</GameMessagesContext.Provider>
			</SecretStateContext.Provider>
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
