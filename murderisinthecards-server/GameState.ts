import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import * as Consts from './Consts';

export class PlayerState extends Schema {
	@type('string')
	public suspect: Consts.Suspect = ('' as Consts.Suspect);

	@type('string')
	public name = '';

	@type('uint8')
	public x = 0;

	@type('uint8')
	public y = 0;

	@type('string')
	public room: (Consts.Room | '') = '';
}

export class GameState extends Schema {

	@type({ map: PlayerState })
	private players = new MapSchema<PlayerState>();

	@type('uint8')
	public phase = Consts.PlayPhase.SETUP;

	@type(['string'])
	public turnOrder = new ArraySchema<string>();

	@type('string')
	public currentPlayer = '';

	@type('int8')
	public dieRoll = 0;

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

	getAllPlayers(): PlayerState[] {
		return Object.values(this.players);
	}

}
