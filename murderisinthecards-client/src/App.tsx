import * as Colyseus from "colyseus.js";
import React from 'react';

const MessageContext = React.createContext<string[]>([]);
const SendMessageContext = React.createContext<(m:string) => void>(undefined!);

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

	const sendMessage = (message: string) => room.send(
		'sendtestchat',
		message
	);

	return (
		<MessageContext.Provider value={messages}>
			<SendMessageContext.Provider value={sendMessage}>
				<MessageSend />
				<MessageList />
			</SendMessageContext.Provider>
		</MessageContext.Provider>
	);
}

function MessageSend() {
	const [message, setMessage] = React.useState('');
	const sendMessage = React.useContext(SendMessageContext);

	const handleSubmit = (evt: React.SyntheticEvent) => {
		evt.preventDefault();
		sendMessage(message);
		setMessage('');
	};

	const handleChange = (evt: React.SyntheticEvent) => {
		const target = evt.target as typeof evt.target & {
			value: string;
		};
		setMessage(target.value);
	}

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Message:
				<input type="text" value={message} onChange={handleChange} />
			</label>
			<input type="submit" value="Send" />
		</form>
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
