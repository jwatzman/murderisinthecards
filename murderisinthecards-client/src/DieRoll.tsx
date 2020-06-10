import React from 'react';

import { PlayPhase } from 'murderisinthecards-common/Consts';

import { GameStateContext } from './Context';

export default function DieRoll() {
	const gameState = React.useContext(GameStateContext);

	// TODO: is this the rigt condition?
	if (gameState.phase !== PlayPhase.MOVEMENT) {
		return null;
	}

	return <div>Die roll remaining: {gameState.dieRoll}</div>;
}
