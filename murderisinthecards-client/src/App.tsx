import * as Colyseus from "colyseus.js";
import React from 'react';

const MessageContext = React.createContext<string[]>([]);

function App() {
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [messages, setMessages] = React.useState(['init message']);

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

		room.onMessage('receivetestchat', message => {
			setMessages(oldMessages => oldMessages.concat([message]));
		});
	}, [room]);

	if (!room) {
		return <div>Connecting...</div>;
	}

	return (
		<MessageContext.Provider value={messages}>
			<MessageList />
		</MessageContext.Provider>
	);
}

function MessageList() {
	const messages = React.useContext(MessageContext);

	return (
		<div>
			{messages.map(message => <div>{message}</div>)}
		</div>
	);
}

export default App;
