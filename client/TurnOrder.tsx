import React from 'react';

import { GameStateContext } from './Context';
import getSupectColor from './SuspectColor';
import styles from './TurnOrder.module.css';

export default function TurnOrder() {
	const gameState = React.useContext(GameStateContext);
	const names = [];

	for (const playerId of gameState.turnOrder) {
		const player = gameState.players.get(playerId)!;
		const suspectColorStyle = {
			borderColor: getSupectColor(player.suspect),
		};
		names.push(
			<li key={playerId}>
				<span className={styles.turn} style={suspectColorStyle}>
					{player.name}
				</span>
			</li>,
		);
	}

	return (
		<div>
			Turn order: <ol className={styles.turnList}>{names}</ol>
		</div>
	);
}
