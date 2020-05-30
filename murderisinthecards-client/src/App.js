import * as Colyseus from "colyseus.js";
import React from 'react';

const RoomContext = React.createContext({});

function App() {
	const [room, setRoom] = React.useState(null);

	React.useEffect(() => {
		if (room) {
			return;
		}

		const client = new Colyseus.Client('ws://localhost:2567');
		client.joinOrCreate('my_room').then(room => {
			setRoom(room);
		});
	});

	if (!room) {
		return <div>Connecting...</div>;
	}

	return (
		<RoomContext.Provider value={room}>
			<MessageList />
		</RoomContext.Provider>
	);
}

function MessageList() {
	const room = React.useContext(RoomContext);
	const [messages, setMessages] = React.useState(['init message']);

	React.useEffect(() => {
		room.onMessage('receivetestchat', message => {
			setMessages(oldMessages => oldMessages.concat([message]));
		});
	}, [room]);

	return (
		<div>
			{messages.map(message => <div>{message}</div>)}
		</div>
	);
}

export default App;
