import * as Colyseus from 'colyseus.js';
import React from 'react';

import { ClientToServerMessage } from './Consts';
import GameSetup from './GameSetup';
import { GameStateContext, SendMessageContext } from './Context';

function App() {
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [gameState, setGameState] = React.useState(null);

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
			setGameState(Object.assign({}, newState)); // XXX should be deep copy
		});

		room.onError((_, message) => {
			window.alert(message);
		});
	}, [room]);

	if (!room) {
		return <div>Connecting...</div>;
	}

	const sendMessage = (type: ClientToServerMessage, message: any) =>
		room.send(type, message);

	return (
		<GameStateContext.Provider value={gameState}>
			<SendMessageContext.Provider value={sendMessage}>
				<GameSetup />
			</SendMessageContext.Provider>
		</GameStateContext.Provider>
	);
}

export default App;
