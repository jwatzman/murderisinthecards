import { PlayPhase } from './Consts';
import { ConstGameState } from './ConstGameState';

export function playerSetup(
	playerId: string,
	state: ConstGameState,
	name: string,
	suspect: string
): string | null {
	if (state.phase != PlayPhase.SETUP) {
		return 'You can\'t select a name and suspect after the game has started!';
	}

	if (!name) {
		return 'You must set a name!';
	}

	// TODO: remove this restriction?
	const player = state.players[playerId];
	if (player.name && player.suspect) {
		return 'You\'ve already selected a name and suspect!';
	}

	for (const otherPlayer of Object.values(state.players)) {
		if (otherPlayer.suspect == suspect) {
			return otherPlayer.name + ' already is ' + suspect;
		}
	}

	return null;
}

export function beginGame(
	playerId: string,
	state: ConstGameState,
): string | null {
	if (state.phase != PlayPhase.SETUP) {
		return 'The game has already begun!';
	}

	for (const otherPlayer of Object.values(state.players)) {
		if (!otherPlayer.name || !otherPlayer.suspect) {
			return 'Not all players are ready!';
		}
	}

	return null;
}

export function rollDie(
	playerId: string,
	state: ConstGameState,
): string | null {
	if (playerId != state.currentPlayer) {
		return 'Not your turn!';
	}

	if (state.phase != PlayPhase.BEGIN_TURN) {
		return 'You can only roll at the beginning of your turn!';
	}

	return null;
}

export function endTurn(
	playerId: string,
	state: ConstGameState,
): string | null {
	if (playerId != state.currentPlayer) {
		return 'Not your turn!';
	}

	if (state.phase !== PlayPhase.MOVEMENT) {
		return 'You can\'t do that now!';
	}

	return null;
}
