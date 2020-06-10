import React from 'react';

import {
	GameStateContext,
	SecretStateContext,
} from './Context'

export default function TurnActions() {
	const gameState = React.useContext(GameStateContext);
	const secretState = React.useContext(SecretStateContext);

	if (gameState.currentPlayer !== secretState) {
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
	return <li>Roll die</li>;
}

function EndTurn() {
	return <li>End turn</li>;
}
