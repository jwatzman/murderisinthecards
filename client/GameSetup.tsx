import { css } from '@emotion/css';
import React from 'react';

import * as CanDo from 'common/CanDo';
import { ClientToServerMessage, Suspect } from 'common/Consts';

import {
	GameStateContext,
	RoomIdContext,
	SendMessageContext,
	SessionIdContext,
} from './Context';
import SelectEnum from './SelectEnum';

function GameSetup() {
	return (
		<div
			className={css({
				margin: '10px',
			})}
		>
			<div
				className={css({
					'margin-bottom': '10px',
					input: {
						margin: '0 10px',
					},
					form: {
						'margin-bottom': '10px',
					},
				})}
			>
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
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);
	const sendMessage = React.useContext(SendMessageContext);

	const [name, setName] = React.useState('');
	const [suspect, setSuspect] = React.useState(Suspect.BLOOD);

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.PLAYER_SETUP, { name, suspect });
	};

	const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.currentTarget.value);
	};

	const err = CanDo.playerSetup(sessionId, gameState, name, suspect);
	const canSetUp = err === null;

	const disabled = (suspect: Suspect) =>
		CanDo.playerSetup(sessionId, gameState, 'dummy', suspect) !== null;

	return (
		<form onSubmit={submit}>
			<label>
				Name:
				<input type="text" value={name} onChange={changeName} />
			</label>
			<SelectEnum
				disabled={disabled}
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
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const err = CanDo.beginGame(sessionId, gameState);
	const readyToBegin = err === null;

	const start = () => {
		sendMessage(ClientToServerMessage.BEGIN_GAME, null);
	};

	return (
		<button disabled={!readyToBegin} onClick={start}>
			Begin Game
		</button>
	);
}

function GameLink() {
	const roomId = React.useContext(RoomIdContext);

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
		<div className={css({ 'font-size': '10px', 'margin-top': '10px' })}>
			Murder Is In The Cards. Homepage: <a href={homepage}>{homepage}</a>
		</div>
	);
}

export default GameSetup;
