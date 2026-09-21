import React from 'react';

import { GameStateContext, PlayerIdContext } from '#client/Context';
import styles from '#client/YourTurnWrap.module.css';
import type { GameState } from '#common/gameState';

type props = { children: React.ReactNode };
export default function YourTurnWrap(props: props) {
	const gameState = React.use(GameStateContext);
	const playerId = React.use(PlayerIdContext);

	const className = waitingOnPlayer(gameState, playerId)
		? styles.turn
		: styles.noturn;

	return <div className={className}>{props.children}</div>;
}

function waitingOnPlayer(gameState: GameState, playerId: string): boolean {
	if (gameState.phase === 'GAME_OVER') {
		return false;
	}

	if (
		gameState.phase === 'SUGGESTION_RESOLUTION' &&
		gameState.currentPlayerDisprovingSuggestion
	) {
		return gameState.currentPlayerDisprovingSuggestion === playerId;
	}

	return gameState.currentPlayer === playerId;
}
