import { Client, Room as ColRoom } from 'colyseus';

import { Coord } from 'murderisinthecards-common/BoardLayout';
import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	Card,
	ClientToServerMessage,
	PlayPhase,
	Room,
	ServerToClientMessage,
	Solution,
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

		// TODO: how does type safety work for these handlers? What happens if the
		// client sends down something that isn't a Suspect for player setup, or
		// that isn't the right format of object at all?
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
		this.onMessage(
			ClientToServerMessage.MAKE_SUGGESTION,
			this.handleMakeSuggestion.bind(this),
		);
		this.onMessage(
			ClientToServerMessage.DISPROVE_SUGGESTION,
			this.handleDisproveSuggestion.bind(this),
		);
		this.onMessage(
			ClientToServerMessage.MAKE_ACCUSATION,
			this.handleMakeAccusation.bind(this),
		);
	}

	onJoin(client: Client): void {
		// TODO: make sure we are in setup... what do we do otherwise?
		const sessionId = client.sessionId;
		console.log('Join', sessionId);
		this.state.createPlayer(sessionId);
	}

	async onLeave(client: Client, _consented: boolean): Promise<void> {
		const sessionId = client.sessionId;
		console.log('Disconnected', sessionId);

		if (this.state.phase == PlayPhase.SETUP) {
			this.state.removePlayer(sessionId);
			return;
		}

		const name = this.state.getPlayer(sessionId).name;
		this.broadcastGameMessage(`${name} disconnected`);

		if (this.state.phase == PlayPhase.GAME_OVER) {
			return;
		}

		try {
			await this.allowReconnection(client, 60*3);
			console.log('Reconnected', sessionId);

			this.sendCardsToPlayer(client);
			this.broadcastGameMessage(`${name} reconnected`);
		} catch (_e) {
			console.log('Did not reconnect', sessionId);
			this.broadcastGameMessage(
				`${name} did not reconnect; the game cannot continue`
			);
			this.endGame();
		}
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

	private handleMakeSuggestion(
		client: Client,
		suggestion: Solution,
	) {
		const sessionId = client.sessionId;

		const err = CanDo.makeSuggestion(
			sessionId,
			this.state.toConstGameState(),
			suggestion,
		);
		if (err) {
			client.error(0, err);
			return;
		}

		this.state.phase = PlayPhase.SUGGESTION_RESOLUTION;
		for (let i = 0; i < suggestion.length; i++) {
			this.state.suggestion[i] = suggestion[i];
		}

		const [suspect, weapon, room] = suggestion;
		const name = this.state.getCurrentPlayer().name;
		this.broadcastGameMessage(
			`${name} suggests ${suspect} with the ${weapon} in the ${room}`
		);

		// TODO: move suspect into room

		this.advanceDisproving();
	}

	private handleDisproveSuggestion(
		client: Client,
		card: Card | null,
	) {
		const sessionId = client.sessionId;
		const player = this.state.getPlayer(sessionId);

		const err = CanDo.disproveSuggestion(
			sessionId,
			this.state.toConstGameState(),
			player.cards,
			card,
		);
		if (err) {
			client.error(0, err);
			return;
		}

		if (card) {
			this.broadcastGameMessage(`${player.name} disproves the suggestion!`);

			// Ugh, I wish there were a better way to do this.
			for (const otherClient of this.clients) {
				if (otherClient.sessionId === this.state.currentPlayer) {
					otherClient.send(
						ServerToClientMessage.GAME_MESSAGE,
						`${player.name} shows you their ${card} card!`
					);
					break;
				}
			}

			this.state.currentPlayerDisprovingSuggestion = '';
		} else {
			this.broadcastGameMessage(
				`${player.name} cannot disprove the suggestion!`
			);
			this.advanceDisproving();
		}
	}

	private handleMakeAccusation(
		client: Client,
		accusation: Solution,
	) {
		const err = CanDo.makeAccusation(
			client.sessionId,
			this.state.toConstGameState(),
		);
		if (err) {
			client.error(0, err);
			return;
		}

		const [suspect, weapon, room] = accusation;
		const currentPlayer = this.state.getCurrentPlayer();
		const name = currentPlayer.name;

		this.broadcastGameMessage(
			`${name} accuses ${suspect} with the ${weapon} in the ${room}!`
		);

		if (this.isCorrectAccusation(accusation)) {
			this.broadcastGameMessage(`${name} wins!`);
			this.endGame();
		} else {
			this.broadcastGameMessage(
				`${name} made an incorrect accusation and is eliminated!`
			);
			currentPlayer.eliminated = true;
			this.advanceTurn();
		}
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

		let player = '';
		while (cards.length > 0) {
			player = this.getNextPlayer(player);
			this.state.getPlayer(player).cards.push(cards.pop()!);
		}
	}

	private getNextPlayer(player: string): string {
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

		let playersTried = 0;
		const numPlayers = this.state.getAllPlayerIds().length;
		do {
			this.state.currentPlayer = this.getNextPlayer(this.state.currentPlayer);
			playersTried++;
		} while (this.state.getCurrentPlayer().eliminated && playersTried < numPlayers);

		if (this.state.getCurrentPlayer().eliminated) {
			this.broadcastGameMessage(
				'All players have been eliminated. Game over.'
			);
			this.endGame();
			return;
		}

		const name = this.state.getCurrentPlayer().name;
		this.broadcastGameMessage(`${name}'s turn`);
	}

	private advanceDisproving() {
		if (!this.state.currentPlayerDisprovingSuggestion) {
			this.state.currentPlayerDisprovingSuggestion = this.state.currentPlayer;
		}

		const next =
			this.getNextPlayer(this.state.currentPlayerDisprovingSuggestion);

		if (next == this.state.currentPlayer) {
			const name = this.state.getCurrentPlayer().name;
			this.broadcastGameMessage(
				`No one was able to disprove ${name}'s suggestion!`
			);
			this.state.currentPlayerDisprovingSuggestion = '';
		} else {
			this.state.currentPlayerDisprovingSuggestion = next;
		}
	}

	private isCorrectAccusation(accusation: Solution) {
		for (let i = 0; i < this.state.solution.length; i++) {
			if (this.state.solution[i] !== accusation[i]) {
				return false;
			}
		}

		return true;
	}

	private endGame() {
		console.log('Game over');
		this.state.currentPlayer = '';
		this.state.phase = PlayPhase.GAME_OVER;
	}

}
