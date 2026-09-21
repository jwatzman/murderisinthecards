import React from 'react';

import { GameStateContext } from '#client/Context';

export default function DieRoll() {
	const gameState = React.use(GameStateContext);

	if (gameState.phase !== 'MOVEMENT') {
		return null;
	}

	if (gameState.dieRoll === 0) {
		return null;
	}

	return <div>Die roll remaining: {gameState.dieRoll}</div>;
}
