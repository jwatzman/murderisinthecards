import { Schema, type, MapSchema } from '@colyseus/schema';
import * as Consts from './Consts';

export class PlayerState extends Schema {
	@type('string')
	suspect: Consts.Suspect = null;

	@type('string')
	name: string = null;

	selectSuspect(suspect: Consts.Suspect): void {
		this.suspect = suspect;
	}

	setName(name: string): void {
		this.name = name;
	}
}

export class GameState extends Schema {

	@type({ map: PlayerState })
	players = new MapSchema<PlayerState>();

	@type('uint8')
	phase = Consts.PlayPhase.SETUP;

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

}
