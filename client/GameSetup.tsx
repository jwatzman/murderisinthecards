import React from 'react';

import {
	GameStateContext,
	PlayerIdContext,
	RoomIdContext,
	SendMessageContext,
} from '#client/Context';
import styles from '#client/GameSetup.module.css';
import SelectEnum from '#client/SelectEnum';
import * as CanDo from '#common/canDo';
import type { Suspect } from '#common/cards';
import { allSuspects } from '#common/cards';

function GameSetup() {
	return (
		<div className={styles.wrap}>
			<div className={styles.setup}>
				<SelectSuspect />
				<ConnectedPlayers />
				<BeginGame />
			</div>
			<GameLink />
			<License />
		</div>
	);
}

function SelectSuspect() {
	const gameState = React.use(GameStateContext);
	const playerId = React.use(PlayerIdContext);
	const sendMessage = React.use(SendMessageContext);

	const [name, setName] = React.useState('');
	const [suspect, setSuspect] = React.useState<Suspect>(allSuspects[0]);

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage({ type: 'player_setup', name, suspect });
	};

	const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.currentTarget.value);
	};

	const err = CanDo.playerSetup(playerId, gameState, name, suspect);
	const canSetUp = err === null;

	const disabled = (suspect: Suspect) =>
		CanDo.playerSetup(playerId, gameState, 'dummy', suspect) !== null;

	return (
		<form onSubmit={submit}>
			<label>
				Name:
				<input type="text" value={name} onChange={changeName} />
			</label>
			<SelectEnum
				disabled={disabled}
				onChange={setSuspect}
				values={allSuspects}
				value={suspect}
			/>
			<input disabled={!canSetUp} type="submit" value="Submit" />
		</form>
	);
}

function ConnectedPlayers() {
	const gameState = React.use(GameStateContext);
	const players = gameState.players;

	const playerList = Array.from(players).map(([id, player]) => {
		if (!player.name || !player.suspect) {
			return <li key={id}>New Player</li>;
		}

		return (
			<li key={id}>
				{player.name} is... {player.suspect}!
			</li>
		);
	});

	return (
		<div>
			Connected Players:
			<ul>{playerList}</ul>
		</div>
	);
}

function BeginGame() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);

	const err = CanDo.beginGame(playerId, gameState);
	const readyToBegin = err === null;

	const start = () => {
		sendMessage({ type: 'begin_game' });
	};

	return (
		<button disabled={!readyToBegin} onClick={start}>
			Begin Game
		</button>
	);
}

function GameLink() {
	const roomId = React.use(RoomIdContext);

	const url = new URL(window.location.toString());
	url.searchParams.set('r', roomId);

	const urlStr = url.toString();

	const disable = (e: React.SyntheticEvent) => {
		e.preventDefault();
	};

	return (
		<div>
			Game join link:{' '}
			<a href={urlStr} onClick={disable}>
				{urlStr}
			</a>
		</div>
	);
}

function License() {
	const homepage = 'https://github.com/jwatzman/murderisinthecards';
	return (
		<div className={styles.license}>
			Murder Is In The Cards. Homepage: <a href={homepage}>{homepage}</a>
		</div>
	);
}

export default GameSetup;
