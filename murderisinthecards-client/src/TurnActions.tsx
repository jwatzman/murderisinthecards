import React from 'react';

import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	ClientToServerMessage,
	Solution,
	Suspect,
	Weapon,
} from 'murderisinthecards-common/Consts';

import {
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
} from './Context'
import SelectEnum from './SelectEnum';

export default function TurnActions() {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);

	if (gameState.currentPlayer !== sessionId) {
		return null;
	}

	return (
		<div>
			Your turn!
			<ul>
				<RollDie />
				<MakeSuggestion />
				<EndTurn />
			</ul>
		</div>
	);
}

function RollDie() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const err = CanDo.rollDie(sessionId, gameState);
	const canRoll = err === null;
	if (!canRoll) {
		return null;
	}

	const roll = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.ROLL_DIE, null);
	};

	return (
		<li><button onClick={roll}>Roll die</button></li>
	);
}

function MakeSuggestion() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const [suspect, setSuspect] = React.useState(Suspect.BLOOD);
	const [weapon, setWeapon] = React.useState(Weapon.AK47);

	const err = CanDo.makeAnySuggestion(sessionId, gameState);
	const canSuggest = err === null;
	if (!canSuggest) {
		return null;
	}

	const room = gameState.players[sessionId].room;
	if (!room) {
		throw new RangeError('Expected CanDo to ensure in a room');
	}

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		const suggestion: Solution = [suspect, weapon, room];
		sendMessage(ClientToServerMessage.MAKE_SUGGESTION, suggestion);
	}

	return (
		<li>
			<form onSubmit={submit}>
				<SelectEnum
					onChange={setSuspect}
					values={Object.values(Suspect)}
					value={suspect}
				/>
				with the
				<SelectEnum
					onChange={setWeapon}
					values={Object.values(Weapon)}
					value={weapon}
				/>
				in the {room}
				<input type="submit" value="Suggest" />
			</form>
		</li>
	);
}

function EndTurn() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const err = CanDo.endTurn(sessionId, gameState);
	const canEnd = err === null;
	if (!canEnd) {
		return null;
	}

	const end = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.END_TURN, null);
	};

	return (
		<li><button onClick={end}>End turn</button></li>
	);
}
