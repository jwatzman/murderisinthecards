import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';

import {
	Card,
	Room,
	Suspect,
	PlayPhase,
	Solution,
} from 'common/Consts';
import { ConstGameState } from 'common/ConstGameState';

export class PlayerState extends Schema {
	@type('string')
	public suspect: Suspect = null!;

	@type('string')
	public name = '';

	@type('boolean')
	public eliminated = false;

	@type('uint8')
	public x = 0;

	@type('uint8')
	public y = 0;

	@type('string')
	public room: (Room | '') = '';

	@type('boolean')
	public teleported = false;

	// Not sync'd in main state:
	public cards: Card[] = [];
}

export class GameState extends Schema {

	@type({ map: PlayerState })
	private players = new MapSchema<PlayerState>();

	@type('uint8')
	public phase = PlayPhase.SETUP;

	@type(['string'])
	public turnOrder = new ArraySchema<string>();

	@type('string')
	public currentPlayer = '';

	@type('uint8')
	public dieRoll = 0;

	@type(['string'])
	public suggestion = new ArraySchema<Card>();

	@type('string')
	public currentPlayerDisprovingSuggestion = '';

	@type('string')
	public leftRoom: (Room | '') = '';

	// Not sync'd in main state:
	public solution: Solution = null!;

	toConstGameState(): ConstGameState {
		// This is a dirty lie, but close enough to the truth to work, and
		// incredibly useful.
		return (this as unknown) as ConstGameState;
	}

	createPlayer(id: string): void {
		console.log('Creating player', id);
		this.players.set(id, new PlayerState());
	}

	removePlayer(id: string): void {
		console.log('Removing player', id);
		this.players.delete(id);
	}

	getPlayer(id: string): PlayerState {
		const player = this.players.get(id);
		if (player === undefined) {
			throw new RangeError('Unknown player ' + id);
		}
		return player;
	}

	getCurrentPlayer(): PlayerState {
		return this.getPlayer(this.currentPlayer);
	}

	getCurrentPlayerAtBeginning(): PlayerState | undefined {
		return this.players.get(this.currentPlayer);
	}

	getAllPlayerIds(): string[] {
		return Array.from(this.players.keys());
	}

	getAllPlayers(): PlayerState[] {
		return Array.from(this.players.values());
	}

}
