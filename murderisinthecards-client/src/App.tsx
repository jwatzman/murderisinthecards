import * as Colyseus from 'colyseus.js';
import React from 'react';
import { $enum } from 'ts-enum-util';

import * as Consts from './Consts';

type PlayerState = {suspect: Consts.Suspect, name: string};
type GameState = {players: {[id: string]: PlayerState}, phase: Consts.PlayPhase};

const MessageContext = React.createContext<string[]>([]);
const SendMessageContext = React.createContext<
	(ty: Consts.ClientToServerMessage, m: string) => void
>(undefined!);
const StateContext = React.createContext<GameState | null>(null);

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

		room.onStateChange((newState) => {
			setState(Object.assign({}, newState)); // XXX should be deep copy
		});
	}, [room]);

	if (!room) {
		return <div>Connecting...</div>;
	}

	const sendMessage = (type: Consts.ClientToServerMessage, message: string) =>
		room.send(type, message);

	return (
		<MessageContext.Provider value={messages}>
			<SendMessageContext.Provider value={sendMessage}>
				<StateContext.Provider value={state}>
					<SelectSuspect />
					<ConnectedPlayers />
				</StateContext.Provider>
			</SendMessageContext.Provider>
		</MessageContext.Provider>
	);
}

function SelectSuspect() {
	const sendMessage = React.useContext(SendMessageContext);

	const [name, setName] = React.useState('');
	const [suspect, setSuspect] = React.useState(Consts.Suspect.BLOOD);

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(Consts.ClientToServerMessage.SET_NAME, name);
		sendMessage(Consts.ClientToServerMessage.SELECT_SUSPECT, suspect);
	};

	const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.currentTarget.value);
	};

	const changeSuspect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSuspect(e.currentTarget.value as Consts.Suspect);
	};

	const suspectOptions = $enum(Consts.Suspect).map(
		s => <option value={s} key={s}>{s}</option>
	);

	return (
		<form onSubmit={submit}>
			<label>
				Name:
				<input type="text" value={name} onChange={changeName} />
			</label>
			<select value={suspect} onChange={changeSuspect}>
				{suspectOptions}
			</select>
			<input type="submit" value="Submit" />
		</form>
	);
}

function ConnectedPlayers() {
	const state = React.useContext(StateContext);
	if (!state) {
		return null;
	}

	const players = state.players;
	const playerList = Object.entries(players).map(([id, player]) => {
		if (!player.name || !player.suspect) {
			return <li key={id}>New Player</li>;
		}

		return <li key={id}>{player.name} is... {player.suspect}!</li>;
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
