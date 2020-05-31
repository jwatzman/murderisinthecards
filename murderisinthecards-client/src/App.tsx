import * as Colyseus from "colyseus.js";
import React from 'react';

type Player = {numMessages: number};
type State = {players: {[id: string]: Player}};

const MessageContext = React.createContext<string[]>([]);
const SendMessageContext = React.createContext<(m:string) => void>(undefined!);
const StateContext = React.createContext<State | null>(null);

function App() {
	const [room, setRoom] = React.useState<Colyseus.Room | null>(null);
	const [messages, setMessages] = React.useState(['init message']);
	const [state, setState] = React.useState(null);

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

		room.onStateChange((newState) => {
			setState(Object.assign({}, newState)); // XXX should be deep copy
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
				<StateContext.Provider value={state}>
					<MessageSend />
					<MessageList />
					<ConnectedPlayers />
				</StateContext.Provider>
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
		<ul>
			{messages.map((message, n) => <li key={n}>{message}</li>)}
		</ul>
	);
}

function ConnectedPlayers() {
	const state = React.useContext(StateContext);
	if (!state) {
		return null;
	}

	const players = state.players;
	const playerList = Object.entries(players).map(([id, player]) => {
		return <li key={id}>{id} has posted {player.numMessages} messages.</li>;
	});

	return (
		<div>
			Connected Players:
			<ul>
				{playerList}
			</ul>
		</div>
	);
}

export default App;
