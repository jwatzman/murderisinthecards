import React from 'react';
import { $enum } from 'ts-enum-util';

import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	ClientToServerMessage, Suspect
} from 'murderisinthecards-common/Consts';

import {
	GameStateContext,
	SecretStateContext,
	SendMessageContext,
} from './Context'

function GameSetup() {
	return (
		<>
			<SelectSuspect />
			<ConnectedPlayers />
			<BeginGame />
		</>
	);
}

function SelectSuspect() {
	const gameState = React.useContext(GameStateContext);
	const secretState = React.useContext(SecretStateContext);
	const sendMessage = React.useContext(SendMessageContext);

	const [name, setName] = React.useState('');
	const [suspect, setSuspect] = React.useState(Suspect.BLOOD);

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.PLAYER_SETUP, {name, suspect});
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

	const err = CanDo.playerSetup(
		secretState,
		gameState,
		name,
		suspect,
	);
	const canSetUp = err === null;

	return (
		<form onSubmit={submit}>
			<label>
				Name:
				<input type="text" value={name} onChange={changeName} />
			</label>
			<select value={suspect} onChange={changeSuspect}>
				{suspectOptions}
			</select>
			<input disabled={!canSetUp} type="submit" value="Submit" />
		</form>
	);
}

function ConnectedPlayers() {
	const gameState = React.useContext(GameStateContext);
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

function BeginGame() {
	const gameState = React.useContext(GameStateContext);
	const secretState = React.useContext(SecretStateContext);
	const sendMessage = React.useContext(SendMessageContext);

	const err = CanDo.beginGame(secretState, gameState);
	const readyToBegin = err === null;

	const start = () => {
		sendMessage(ClientToServerMessage.BEGIN_GAME, null);
	};

	return <button disabled={!readyToBegin} onClick={start}>Begin Game</button>;
}

export default GameSetup;
