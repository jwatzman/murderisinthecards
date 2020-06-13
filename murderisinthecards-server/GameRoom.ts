import { Client, Room as ColRoom } from 'colyseus';

import { Coord } from 'murderisinthecards-common/BoardLayout';
import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	ClientToServerMessage, PlayPhase, Room, Suspect
} from 'murderisinthecards-common/Consts';

import { GameState } from './GameState';
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
			ClientToServerMessage.ROLL_DIE,
			this.handleRollDie.bind(this)
		);
		this.onMessage(
			ClientToServerMessage.END_TURN,
			this.handleEndTurn.bind(this)
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

		const err = CanDo.playerSetup(
			sessionId,
			this.state.toConstGameState(),
			name,
			suspect,
		);
		if (err) {
			client.error(0, err);
			return;
		}

		const player = this.state.getPlayer(sessionId);
		const [x,y] = getInitialCoords(suspect);
		player.name = name;
		player.suspect = suspect;
		player.x = x;
		player.y = y;
	}

	private handleBeginGame(client: Client): void {
		const err = CanDo.beginGame(
			client.sessionId,
			this.state.toConstGameState(),
		);
		if (err) {
			client.error(0, err);
			return;
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

	private handleRollDie(
		client: Client,
	) {
		const err = CanDo.rollDie(
			client.sessionId,
			this.state.toConstGameState(),
		);
		if (err) {
			client.error(0, err);
			return;
		}

		this.state.dieRoll = Math.floor(Math.random() * 6) + 1;
		this.state.phase = PlayPhase.MOVEMENT;
	}

	private handleEndTurn(
		client: Client
	) {
		const err = CanDo.endTurn(
			client.sessionId,
			this.state.toConstGameState(),
		);
		if (err) {
			client.error(0, err);
			return;
		}

		this.advanceTurn();
	}

	private handleMoveToCoord(
		client: Client,
		coord: Coord,
	) {
		const sessionId = client.sessionId;

		const err = CanDo.moveToCoord(
			sessionId,
			this.state.toConstGameState(),
			coord,
		);
		if (err) {
			client.error(0, err);
			return;
		}

		const player = this.state.getPlayer(sessionId);
		[player.x, player.y] = coord;
		player.room = '';
		this.state.dieRoll--;
	}

	private handleMoveToRoom(
		client: Client,
		room: Room,
	) {
		const sessionId = client.sessionId;

		const err = CanDo.moveToRoom(
			sessionId,
			this.state.toConstGameState(),
			room,
		);
		if (err) {
			client.error(0, err);
			return;
		}

		const player = this.state.getPlayer(sessionId);
		player.room = room;
		this.state.dieRoll = 0;
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
