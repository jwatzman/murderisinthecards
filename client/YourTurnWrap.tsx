import React from 'react';
import { css } from '@emotion/css';

import { ConstGameState } from 'common/ConstGameState';
import { PlayPhase } from 'common/Consts';
import { GameStateContext, SessionIdContext } from './Context';

type props = { children: React.ReactNode };
export default function YourTurnWrap(props: props) {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);

	const className = waitingOnPlayer(gameState, sessionId)
		? css({ border: '5px solid green', padding: '5px' })
		: css({ padding: '10px' });

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
