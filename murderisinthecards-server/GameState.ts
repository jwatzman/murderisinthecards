import { Schema, type, MapSchema } from '@colyseus/schema';
import * as Consts from './Consts';

export class PlayerState extends Schema {
	@type('string')
	public suspect: Consts.Suspect = null;

	@type('string')
	public name: string = null;
}

export class GameState extends Schema {

	@type({ map: PlayerState })
	private players = new MapSchema<PlayerState>();

	@type('uint8')
	public phase = Consts.PlayPhase.SETUP;

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
