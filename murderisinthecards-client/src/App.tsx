import * as Colyseus from 'colyseus.js';
import React from 'react';

import { ClientToServerMessage, PlayPhase } from './Consts';
import { GameStateContext, SendMessageContext } from './Context';
import GameSetup from './GameSetup';
import GamePlay from './GamePlay';
import { GameState } from './GameState';

function App() {
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [gameState, setGameState] = React.useState<GameState | null>(null);

	React.useEffect(() => {
		if (room) {
			return;
		}

		const client = new Colyseus.Client('ws://localhost:2567');
		client.joinOrCreate('my_room').then(room => {
			setRoom(room);
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
			<GameStateContext.Provider value={gameState}>
				<Game />
			</GameStateContext.Provider>
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
