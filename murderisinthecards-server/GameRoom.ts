import { Client, Room as ColRoom } from 'colyseus';

import { Coord } from './BoardLayout';
import { GameState } from './GameState';
import { ClientToServerMessage, PlayPhase, Room, Suspect } from './Consts';
import getInitialCoords from './InitialCoords';
import shuffle from './Shuffle';

export class GameRoom extends ColRoom<GameState> {

	onCreate(): void {
		console.log('Room created');
		this.setState(new GameState());

		this.onMessage(
			ClientToServerMessage.PLAYER_SETUP,
			this.handlePlayerSetup.bind(this)
		);
		this.onMessage(
			ClientToServerMessage.BEGIN_GAME,
			this.handleBeginGame.bind(this)
		);
		this.onMessage(
			ClientToServerMessage.MOVE_TO_COORD,
			this.handleMoveToCoord.bind(this),
		);
		this.onMessage(
			ClientToServerMessage.MOVE_TO_ROOM,
			this.handleMoveToRoom.bind(this),
		);
	}

	onJoin(client: Client): void {
		// TODO: make sure we are in setup... what do we do otherwise?
		const sessionId = client.sessionId;
		console.log('Join', sessionId);
		this.state.createPlayer(sessionId);
	}

	onLeave(client: Client, _consented: boolean): void {
		const sessionId = client.sessionId;
		console.log('Leave', sessionId);
		this.state.removePlayer(sessionId);
	}

	onDispose(): void {
		console.log('Room disposed');
	}

	private handlePlayerSetup(
		client: Client,
		{name, suspect}: {name: string, suspect: Suspect}
	) {
		const sessionId = client.sessionId;
		console.log('Player setup', sessionId, name, suspect);

		if (this.state.phase != PlayPhase.SETUP) {
			client.error(
				0,
				'You can\'t select a name and suspect after the game has started!',
			);
			return;
		}

		// TODO: remove this restriction?
		const player = this.state.getPlayer(sessionId);
		if (player.name && player.suspect) {
			client.error(0, 'You\'ve already selected a name and suspect!');
			return;
		}

		for (const otherPlayer of this.state.getAllPlayers()) {
			if (otherPlayer.suspect == suspect) {
				client.error(0, otherPlayer.name + ' already is ' + suspect);
				return;
			}
		}

		const [x,y] = getInitialCoords(suspect);
		player.name = name;
		player.suspect = suspect;
		player.x = x;
		player.y = y;
	}

	private handleBeginGame(client: Client): void {
		if (this.state.phase != PlayPhase.SETUP) {
			client.error(0, 'The game has already begun!');
			return;
		}

		for (const otherPlayer of this.state.getAllPlayers()) {
			if (!otherPlayer.name || !otherPlayer.suspect) {
				client.error(0, 'Not all players are ready!');
				return;
			}
		}

		console.log('Begin game');

		const turnOrderArr = this.state.getAllPlayerIds();
		shuffle(turnOrderArr);
		for (const player of turnOrderArr) {
			this.state.turnOrder.push(player);
		}

		// TODO: shuffle cards
		this.advanceTurn();
	}

	private handleMoveToCoord(
		client: Client,
		coord: Coord,
	) {
		// TODO: check move validity
		const sessionId = client.sessionId;
		const player = this.state.getPlayer(sessionId);
		[player.x, player.y] = coord;
		player.room = '';
	}

	private handleMoveToRoom(
		client: Client,
		room: Room,
	) {
		// TODO: check move validity
		const sessionId = client.sessionId;
		const player = this.state.getPlayer(sessionId);
		player.room = room;
	}

	private advanceTurn(): void {
		this.state.phase = PlayPhase.BEGIN_TURN;
		this.state.dieRoll = 0;

		if (this.state.currentPlayer) {
			const playerIdx =
				this.state.turnOrder.indexOf(this.state.currentPlayer);
			const nextPlayerIdx = (playerIdx + 1) % this.state.turnOrder.length;
			this.state.currentPlayer = this.state.turnOrder[nextPlayerIdx];
		} else {
			this.state.currentPlayer = this.state.turnOrder[0];
		}
	}

}
