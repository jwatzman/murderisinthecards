import React from 'react';

import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	ClientToServerMessage, Suspect
} from 'murderisinthecards-common/Consts';

import {
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
} from './Context'
import SelectEnum from './SelectEnum';

import Styles from './GameSetup.module.css';

function GameSetup() {
	return (
		<>
			<SelectSuspect />
			<ConnectedPlayers />
			<BeginGame />
			<License />
		</>
	);
}

function SelectSuspect() {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);
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

	const err = CanDo.playerSetup(
		sessionId,
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
			<SelectEnum
				onChange={setSuspect}
				values={Object.values(Suspect)}
				value={suspect}
			/>
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
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const err = CanDo.beginGame(sessionId, gameState);
	const readyToBegin = err === null;

	const start = () => {
		sendMessage(ClientToServerMessage.BEGIN_GAME, null);
	};

	return <button disabled={!readyToBegin} onClick={start}>Begin Game</button>;
}

function License() {
	const homepage = 'https://github.com/jwatzman/murderisinthecards';
	return (
		<div className={Styles.license}>
			Murder Is In The Cards. Homepage:
			{' '}
			<a href={homepage}>{homepage}</a>
		</div>
	);
}

export default GameSetup;
