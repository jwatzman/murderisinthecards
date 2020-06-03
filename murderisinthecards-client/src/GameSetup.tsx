import React from 'react';
import { $enum } from 'ts-enum-util';

import { ClientToServerMessage, Suspect } from './Consts';
import { GameStateContext, SendMessageContext } from './Context'

function GameSetup() {
	return (
		<>
			<SelectSuspect />
			<ConnectedPlayers />
		</>
	);
}

function SelectSuspect() {
	const sendMessage = React.useContext(SendMessageContext);

	const [name, setName] = React.useState('');
	const [suspect, setSuspect] = React.useState(Suspect.BLOOD);

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.SET_NAME, name);
		sendMessage(ClientToServerMessage.SELECT_SUSPECT, suspect);
	};

	const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.currentTarget.value);
	};

	const changeSuspect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSuspect(e.currentTarget.value as Suspect);
	};

	const suspectOptions = $enum(Suspect).map(
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
	const gameState = React.useContext(GameStateContext);
	if (!gameState) {
		return null;
	}

	const players = gameState.players;
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

export default GameSetup;
