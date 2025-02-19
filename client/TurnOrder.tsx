import { css } from '@emotion/css';
import React from 'react';

import { GameStateContext } from './Context';
import getSupectColor from './SuspectColor';

const turnListItemClassName = css({
	display: 'inline',
	':after': {
		content: '", "',
	},
	':last-child:after': {
		content: '""',
	},
});

export default function TurnOrder() {
	const gameState = React.useContext(GameStateContext);
	const names = [];

	for (const playerId of gameState.turnOrder) {
		const player = gameState.players.get(playerId)!;
		const suspectColorStyle = {
			borderColor: getSupectColor(player.suspect),
		};
		names.push(
			<li className={turnListItemClassName} key={playerId}>
				<span
					className={css({
						border: '2px solid',
					})}
					style={suspectColorStyle}
				>
					{player.name}
				</span>
			</li>,
		);
	}

	return (
		<div>
			Turn order:{' '}
			<ol
				className={css({
					display: 'inline',
					listStyle: 'none',
					padding: 0,
				})}
			>
				{names}
			</ol>
		</div>
	);
}
