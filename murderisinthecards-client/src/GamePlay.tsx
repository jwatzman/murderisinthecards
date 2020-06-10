import React from 'react';

import DieRoll from './DieRoll';
import GameBoard from './GameBoard';
import TurnActions from './TurnActions';
import TurnOrder from './TurnOrder';

export default function GamePlay() {
	return (
		<>
			<GameBoard />
			<TurnOrder />
			<DieRoll />
			<TurnActions />
		</>
	);
}
