import React from 'react';

import { ConstGameState } from 'murderisinthecards-common/ConstGameState';
import { PlayPhase } from 'murderisinthecards-common/Consts';
import { GameStateContext, SessionIdContext } from './Context';

import Styles from './YourTurnWrap.module.css';

type props = {children: React.ReactNode};
export default function YourTurnWrap(props: props) {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);

	const className = waitingOnPlayer(gameState, sessionId) ?
		Styles.turn : Styles.noturn;

	return (
		<div className={className}>
			{props.children}
		</div>
	);
}

function waitingOnPlayer(
	gameState: ConstGameState,
	sessionId: string,
): boolean {
	if (gameState.phase === PlayPhase.GAME_OVER) {
		return false;
	}

	if (gameState.phase === PlayPhase.SUGGESTION_RESOLUTION) {
		return gameState.currentPlayerDisprovingSuggestion === sessionId;
	}

	return gameState.currentPlayer === sessionId;
}
