import React from 'react';

import * as CanDo from 'murderisinthecards-common/CanDo';
import { ClientToServerMessage } from 'murderisinthecards-common/Consts';

import {
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
} from './Context'

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
