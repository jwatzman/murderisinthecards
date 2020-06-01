import { Schema, type, MapSchema } from '@colyseus/schema';

export class PlayerState extends Schema {
	@type('number')
	numMessages = 0;
}

export class GameState extends Schema {

	@type({ map: PlayerState })
	players = new MapSchema<PlayerState>();

	createPlayer(id: string): void {
		console.log('Creating player', id);
		this.players[id] = new PlayerState();
	}

	removePlayer(id: string): void {
		console.log('Removing player', id);
		delete this.players[id];
	}

	messageReceived(id: string): void {
		this.players[id].numMessages++;
		console.log('Player', id, 'has now sent', this.players[id].numMessages);
	}

}
