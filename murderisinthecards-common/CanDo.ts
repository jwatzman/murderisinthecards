import { PlayPhase, Room } from './Consts';
import { ConstGameState } from './ConstGameState';
import { BoardConfig, Coord } from './BoardLayout';

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

function isDoorOf(
	room: Room,
	[x,y]: Coord,
): boolean {
	for (const [doorX,doorY] of BoardConfig.rooms[room].doors) {
		if (x == doorX && y == doorY) {
			return true;
		}
	}

	return false;
}

export function moveToCoord(
	playerId: string,
	state: ConstGameState,
	[x,y]: Coord,
): string | null {
	if (playerId != state.currentPlayer) {
		return 'Not your turn!';
	}

	if (state.phase != PlayPhase.MOVEMENT) {
		return 'You can\'t do that now!';
	}

	if (state.dieRoll == 0) {
		return 'You can\'t move any more!';
	}

	const [maxX, maxY] = BoardConfig.extent;
	if (x < 0 || y < 0 || x > maxX || y > maxY) {
		return 'Can\'t move off the edge of the board!';
	}

	// TODO: make sure coord isn't under a room
	// TODO: make sure coord isn't occupied

	const player = state.players[playerId];
	const currentRoom = player.room;
	if (currentRoom) {
		if (!isDoorOf(currentRoom, [x,y])) {
			return 'Can only leave through the doors!';
		}
	} else {
		const deltaX = player.x - x;
		const deltaY = player.y - y;
		if (Math.abs(deltaX) + Math.abs(deltaY) != 1) {
			return 'Can\'t move that much!';
		}
	}

	return null;
}

export function moveToRoom(
	playerId: string,
	state: ConstGameState,
	room: Room,
): string | null {
	if (playerId != state.currentPlayer) {
		return 'Not your turn!';
	}

	if (state.phase != PlayPhase.MOVEMENT) {
		return 'You can\'t do that now!';
	}

	if (state.dieRoll == 0) {
		return 'You can\'t move any more!';
	}

	const player = state.players[playerId];
	if (player.room) {
		return 'Already in a room!';
	}

	// TODO check if you left this room this turn

	if (!isDoorOf(room, [player.x, player.y])) {
		return 'Can only enter through the doors!';
	}

	return null;
}
