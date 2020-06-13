import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';

import {
	Card,
	Room,
	Suspect,
	PlayPhase,
	Weapon,
} from 'murderisinthecards-common/Consts';
import { ConstGameState } from 'murderisinthecards-common/ConstGameState';

type Solution = [Suspect, Weapon, Room];

export class PlayerState extends Schema {
	@type('string')
	public suspect: Suspect = null!;

	@type('string')
	public name = '';

	@type('uint8')
	public x = 0;

	@type('uint8')
	public y = 0;

	@type('string')
	public room: (Room | '') = '';

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
	public currentPlayer: string = null!;

	@type('int8')
	public dieRoll = 0;

	// Not sync'd in main state:
	public solution: Solution = null!;

	toConstGameState(): ConstGameState {
		// This is a dirty lie, but close enough to the truth to work, and
		// incredibly useful.
		return (this as any) as ConstGameState;
	}

	createPlayer(id: string): void {
		console.log('Creating player', id);
		this.players[id] = new PlayerState();
	}

	removePlayer(id: string): void {
		console.log('Removing player', id);
		delete this.players[id];
	}

	getPlayer(id: string): PlayerState {
		return this.players[id];
	}

	getAllPlayerIds(): string[] {
		return Object.keys(this.players);
	}

	getAllPlayers(): PlayerState[] {
		return Object.values(this.players);
	}

}
