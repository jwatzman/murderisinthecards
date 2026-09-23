import type { WebSocket } from 'ws';

import * as CanDo from '#common/canDo';
import type { Card, Room } from '#common/cards';
import { allRooms, allSuspects, allWeapons } from '#common/cards';
import type { GameState, Solution } from '#common/gameState';
import type { Coord } from '#common/layout';
import type {
	ClientToServerMessage,
	ServerToClientMessage,
} from '#common/message';
import { Player } from '#server/Player';
import { getInitialCoords } from '#server/initialCoords';
import { newId } from '#server/newId';
import { shuffle } from '#server/shuffle';

export class GameRoom {
	readonly #cleanupCallback: () => void;
	#players: Map<string, Player>;
	#state: Omit<GameState, 'players'>;

	readonly id: string;
	solution: Solution | null;

	constructor(cleanupCallback: () => void) {
		this.#cleanupCallback = cleanupCallback;

		this.#players = new Map();
		this.#state = {
			phase: 'SETUP',
			turnOrder: [],
			currentPlayer: '',
			dieRoll: 0,
			suggestion: null,
			currentPlayerDisprovingSuggestion: '',
			leftRoom: null,
		};

		this.id = newId();
		this.solution = null;
	}

	processMessage(player: Player, message: ClientToServerMessage) {
		try {
			switch (message.type) {
				case 'player_setup':
					this.#handlePlayerSetup(player, message);
					break;
				case 'begin_game':
					this.#handleBeginGame(player);
					break;
				case 'roll_die':
					this.#handleRollDie(player);
					break;
				case 'move_to_coord':
					this.#handleMoveToCoord(player, message.coord);
					break;
				case 'move_to_room':
					this.#handleMoveToRoom(player, message.room);
					break;
				case 'move_through_passage':
					this.#handleMoveThroughPassage(player, message.room);
					break;
				case 'make_suggestion':
					this.#handleMakeSuggestion(player, message.suggestion);
					break;
				case 'disprove_suggestion':
					this.#handleDisproveSuggestion(player, message.card);
					break;
				case 'make_accusation':
					this.#handleMakeAccusation(player, message.accusation);
					break;
				case 'end_turn':
					this.#handleEndTurn(player);
					break;
				default: {
					const _: never = message;
					break;
				}
			}
		} catch (e) {
			console.error(e);
			player.sendErrorMessage(
				`Server error: ${e instanceof Error ? e.message : '(unknown)'}`,
			);
		}

		this.#flushState();
	}

	playerConnected(ws: WebSocket, reconnectToken?: string) {
		if (this.#state.phase === 'SETUP') {
			const player = new Player(ws, this);
			this.#players.set(player.id, player);

			player.sendRoomInfo();
			this.#flushState();
			console.log('Player connected', this.id, player.id);
			return;
		} else {
			for (const player of this.#players.values()) {
				if (player.reconnectToken === reconnectToken) {
					player.setWebSocket(ws);
					player.sendRoomInfo();
					player.sendCards();
					this.#flushState();
					this.#sendGameMessageToAllPlayers(`${player.state.name} reconnected`);
					console.log('Player reconnected', this.id, player.id);
					return;
				}
			}
		}

		ws.terminate();
	}

	playerDisconnected(player: Player) {
		console.log('Player disconnected', this.id, player.id);
		if (this.#state.phase === 'SETUP') {
			this.#players.delete(player.id);
			this.#flushState();
		} else {
			this.#sendGameMessageToAllPlayers(`${player.state.name} disconnected`);
		}

		if ([...this.#players.values()].every((p) => !p.isConnected())) {
			this.#cleanupCallback();
		}
	}

	#sendMessageToAllPlayers(message: ServerToClientMessage) {
		for (const player of this.#players.values()) {
			player.sendMessage(message);
		}
	}

	#sendGameMessageToAllPlayers(message: string) {
		this.#sendMessageToAllPlayers({ type: 'game_message', message });
	}

	#getState(): GameState {
		const players = new Map(
			Array.from(this.#players, ([id, player]) => [id, player.state]),
		);
		return { players, ...this.#state };
	}

	#flushState() {
		this.#sendMessageToAllPlayers({
			type: 'game_state',
			state: this.#getState(),
		});
	}

	#handlePlayerSetup(
		player: Player,
		{ name, suspect }: Extract<ClientToServerMessage, { type: 'player_setup' }>,
	) {
		const err = CanDo.playerSetup(player.id, this.#getState(), name, suspect);
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		const [x, y] = getInitialCoords(suspect);
		player.state.name = name;
		player.state.suspect = suspect;
		player.state.x = x;
		player.state.y = y;
	}

	#handleBeginGame(player: Player) {
		const err = CanDo.beginGame(player.id, this.#getState());
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		this.#state.turnOrder = [...this.#players.keys()];
		shuffle(this.#state.turnOrder);

		const suspects = [...allSuspects];
		shuffle(suspects);
		const weapons = [...allWeapons];
		shuffle(weapons);
		const rooms = [...allRooms];
		shuffle(rooms);

		this.solution = [suspects.pop()!, weapons.pop()!, rooms.pop()!];

		const cards = [...suspects, ...weapons, ...rooms];
		shuffle(cards);
		cards.forEach((card, idx) =>
			this.#players
				.get(this.#state.turnOrder[idx % this.#state.turnOrder.length])!
				.cards.push(card),
		);
		this.#players.forEach((p) => p.sendCards());

		this.#sendGameMessageToAllPlayers('The game begins!');
		this.#advanceTurn();
	}

	#handleRollDie(player: Player) {
		const err = CanDo.rollDie(player.id, this.#getState());
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		this.#state.dieRoll = Math.floor(Math.random() * 6) + 1;
		this.#state.phase = 'MOVEMENT';
		this.#sendGameMessageToAllPlayers(
			`${player.state.name} rolls a ${this.#state.dieRoll}`,
		);
	}

	#handleMoveToCoord(player: Player, coord: Coord) {
		const err = CanDo.moveToCoord(player.id, this.#getState(), coord);
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		[player.state.x, player.state.y] = coord;
		if (player.state.room) {
			this.#state.leftRoom = player.state.room;
		}
		player.state.room = null;
		this.#state.dieRoll--;
	}

	#handleMoveToRoom(player: Player, room: Room) {
		const err = CanDo.moveToRoom(player.id, this.#getState(), room);
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		player.state.room = room;
		this.#state.dieRoll = 0;
	}

	#handleMoveThroughPassage(player: Player, room: Room) {
		const err = CanDo.moveThroughPassage(player.id, this.#getState(), room);
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		player.state.room = room;
		this.#state.phase = 'MOVEMENT';
		this.#state.dieRoll = 0;
	}

	#handleMakeSuggestion(player: Player, suggestion: Solution) {
		const err = CanDo.makeSuggestion(player.id, this.#getState(), suggestion);
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		this.#state.phase = 'SUGGESTION_RESOLUTION';
		this.#state.suggestion = suggestion;

		const [suspect, weapon, room] = suggestion;
		this.#sendGameMessageToAllPlayers(
			`${player.state.name} suggests ${suspect} with the ${weapon} in the ${room}`,
		);

		for (const otherPlayer of this.#players.values()) {
			if (
				otherPlayer.state.suspect === suspect &&
				otherPlayer.state.room !== room
			) {
				otherPlayer.state.room = room;
				otherPlayer.state.teleported = true;
			}
		}

		this.#advanceDisproving();
	}

	#handleDisproveSuggestion(player: Player, card: Card | null) {
		const err = CanDo.disproveSuggestion(
			player.id,
			this.#getState(),
			player.cards,
			card,
		);
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		if (card) {
			this.#sendGameMessageToAllPlayers(
				`${player.state.name} disproves the suggestion!`,
			);

			this.#players.get(this.#state.currentPlayer)!.sendMessage({
				type: 'game_message',
				message: `${player.state.name} shows you their ${card} card!`,
			});

			this.#state.currentPlayerDisprovingSuggestion = '';
		} else {
			this.#sendGameMessageToAllPlayers(
				`${player.state.name} cannot disprove the suggestion!`,
			);
			this.#advanceDisproving();
		}
	}

	#handleMakeAccusation(player: Player, accusation: Solution) {
		const err = CanDo.makeAccusation(player.id, this.#getState());
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		const [suspect, weapon, room] = accusation;
		this.#sendGameMessageToAllPlayers(
			`${player.state.name} accuses ${suspect} with the ${weapon} in the ${room}!`,
		);

		const [solnSuspect, solnWeapn, solnRoom] = this.solution!;
		if (suspect === solnSuspect && weapon === solnWeapn && room === solnRoom) {
			this.#sendGameMessageToAllPlayers(`${player.state.name} wins!`);
			this.#endGame();
		} else {
			this.#sendGameMessageToAllPlayers(
				`${player.state.name} made an incorrect accusation and is eliminated!`,
			);
			player.state.eliminated = true;
			this.#advanceTurn();
		}
	}

	#handleEndTurn(player: Player) {
		const err = CanDo.endTurn(player.id, this.#getState());
		if (err) {
			player.sendErrorMessage(err);
			return;
		}

		this.#advanceTurn();
	}

	#advanceTurn() {
		this.#state.phase = 'BEGIN_TURN';
		this.#state.dieRoll = 0;
		this.#state.leftRoom = null;

		if (this.#state.currentPlayer) {
			this.#players.get(this.#state.currentPlayer)!.state.teleported = false;
		}

		let playersTried = 0;
		do {
			this.#state.currentPlayer = getNext(
				this.#state.turnOrder,
				this.#state.currentPlayer,
			);
			playersTried++;
		} while (
			this.#players.get(this.#state.currentPlayer)!.state.eliminated &&
			playersTried < this.#players.size
		);

		const currentPlayer = this.#players.get(this.#state.currentPlayer)!;
		if (currentPlayer.state.eliminated) {
			this.#sendGameMessageToAllPlayers(
				'All players have been eliminated. Game over.',
			);
			this.#endGame();
			return;
		}

		this.#sendGameMessageToAllPlayers(`${currentPlayer.state.name}'s turn`);
	}

	#advanceDisproving() {
		if (!this.#state.currentPlayerDisprovingSuggestion) {
			this.#state.currentPlayerDisprovingSuggestion = this.#state.currentPlayer;
		}

		const next = getNext(
			this.#state.turnOrder,
			this.#state.currentPlayerDisprovingSuggestion,
		);
		if (next === this.#state.currentPlayer) {
			this.#sendGameMessageToAllPlayers(
				`No one was able to disprove ${this.#players.get(this.#state.currentPlayer)!.state.name}'s suggestion!`,
			);
			this.#state.currentPlayerDisprovingSuggestion = '';
		} else {
			this.#state.currentPlayerDisprovingSuggestion = next;
		}
	}

	#endGame() {
		console.log('Game over', this.id);
		this.#state.currentPlayer = '';
		this.#state.phase = 'GAME_OVER';
	}
}

function getNext<T>(arr: T[], x: T): T {
	const idx = arr.indexOf(x);
	return arr[(idx + 1) % arr.length];
}
