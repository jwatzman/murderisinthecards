import React from 'react';

import { GameStateContext, SessionIdContext } from '#client/Context';
import styles from '#client/YourTurnWrap.module.css';
import type { ConstGameState } from '#common/ConstGameState';
import { PlayPhase } from '#common/Consts';

type props = { children: React.ReactNode };
export default function YourTurnWrap(props: props) {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);

	const className = waitingOnPlayer(gameState, sessionId)
		? styles.turn
		: styles.noturn;

	return <div className={className}>{props.children}</div>;
}

function waitingOnPlayer(
	gameState: ConstGameState,
	sessionId: string,
): boolean {
	if (gameState.phase === PlayPhase.GAME_OVER) {
		return false;
	}

	if (
		gameState.phase === PlayPhase.SUGGESTION_RESOLUTION &&
		gameState.currentPlayerDisprovingSuggestion
	) {
		return gameState.currentPlayerDisprovingSuggestion === sessionId;
	}

	return gameState.currentPlayer === sessionId;
}
