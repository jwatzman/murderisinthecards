import React from 'react';

import { GameStateContext } from './Context';
import getSupectColor from './SuspectColor';

import Styles from './TurnOrder.module.css';

export default function TurnOrder() {
	const gameState = React.useContext(GameStateContext);
	const names = [];

	for (const playerId of gameState.turnOrder) {
		const player = gameState.players.get(playerId)!;
		const style = {
			borderColor: getSupectColor(player.suspect),
		};
		names.push(
			<li key={playerId}>
				<span className={Styles.turn} style={style}>
					{player.name}
				</span>
			</li>
		);
	}

	return (
		<div>
			Turn order:
			{' '}
			<ol className={Styles.turnList}>
				{names}
			</ol>
		</div>
	);
}
