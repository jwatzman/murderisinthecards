import { Client, Room as ColRoom } from 'colyseus';

import { Coord } from 'murderisinthecards-common/BoardLayout';
import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	ClientToServerMessage,
	PlayPhase,
	Room,
	ServerToClientMessage,
	Suspect,
	Weapon,
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

		const turnOrderArr = this.state.getAllPlayerIds();
		shuffle(turnOrderArr);
		for (const player of turnOrderArr) {
			this.state.turnOrder.push(player);
		}

		this.shuffleCards();
		for (const client of this.clients) {
			this.sendCardsToPlayer(client);
		}

		this.broadcastGameMessage('The game begins!');
		this.advanceTurn();
	}

	private handleRollDie(
		client: Client,
	) {
		const sessionId = client.sessionId;
		const err = CanDo.rollDie(
			sessionId,
			this.state.toConstGameState(),
		);
		if (err) {
			client.error(0, err);
			return;
		}

		this.state.dieRoll = Math.floor(Math.random() * 6) + 1;
		this.state.phase = PlayPhase.MOVEMENT;
		this.broadcastGameMessage(
			this.state.getPlayer(sessionId).name + ' rolls a ' + this.state.dieRoll
		);
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

	private broadcastGameMessage(message: string) {
		this.broadcast(ServerToClientMessage.GAME_MESSAGE, message);
	}

	private sendCardsToPlayer(client: Client) {
		client.send(
			ServerToClientMessage.YOUR_CARDS,
			this.state.getPlayer(client.sessionId).cards
		);
	}

	private shuffleCards() {
		const suspects = Object.values(Suspect);
		shuffle(suspects);

		const weapons = Object.values(Weapon);
		shuffle(weapons);

		const rooms = Object.values(Room);
		shuffle(rooms);

		this.state.solution = [suspects.pop()!, weapons.pop()!, rooms.pop()!];

		const cards = [...suspects, ...weapons, ...rooms];
		shuffle(cards);

		let player = null;
		while (cards.length > 0) {
			player = this.getNextPlayer(player);
			this.state.getPlayer(player).cards.push(cards.pop()!);
		}
	}

	private getNextPlayer(player: string | null): string {
		if (player) {
			const playerIdx =
				this.state.turnOrder.indexOf(player);
			const nextPlayerIdx = (playerIdx + 1) % this.state.turnOrder.length;
			return this.state.turnOrder[nextPlayerIdx];
		} else {
			return this.state.turnOrder[0];
		}
	}

	private advanceTurn() {
		this.state.phase = PlayPhase.BEGIN_TURN;
		this.state.dieRoll = 0;
		this.state.currentPlayer = this.getNextPlayer(this.state.currentPlayer);

		this.broadcastGameMessage(
			this.state.getPlayer(this.state.currentPlayer).name + '\'s turn'
		);
	}

}
