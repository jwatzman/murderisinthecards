import React from 'react';

import { GameStateContext } from './Context';

export default function TurnOrder() {
	const gameState = React.useContext(GameStateContext);
	const names = [];

	for (const player of gameState.turnOrder) {
		// TODO: include suspect somehow? Color the text?
		names.push(gameState.players[player].name);
	}

	return (
		<div>
			Turn Order: {names.join(', ')}
		</div>
	);
}
