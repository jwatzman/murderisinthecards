import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import * as GameConfig from "./GameConfig";

export class Player extends Schema {
	@type("number")
	numMessages = 0;
}

export class State extends Schema {

	@type({ map: Player })
	players = new MapSchema<Player>();

	createPlayer(id: string) {
		console.log('Creating player', id);
		this.players[id] = new Player();
	}

	removePlayer(id: string) {
		console.log('Removing player', id);
		delete this.players[id];
	}

	messageReceived(id: string) {
		this.players[id].numMessages++;
		console.log('Player', id, 'has now sent', this.players[id].numMessages);
	}

}

export class MyRoom extends Room<State> {

	onCreate(options: any) {
		console.log('Room created', options);
		this.setState(new State());

		this.onMessage("sendtestchat", (client, message) => {
			const sessionId = client.sessionId;
			console.log('Got testchat from', sessionId, ':', message);
			this.state.messageReceived(sessionId);
			this.broadcast('receivetestchat', `${sessionId}: ${message}`);
		});

	}

	onJoin(client: Client, options: any) {
		const sessionId = client.sessionId;
		console.log('Join', sessionId);
		this.state.createPlayer(sessionId);
		this.broadcast('receivetestchat', `${sessionId} joined.`);
	}

	onLeave(client: Client, consented: boolean) {
		const sessionId = client.sessionId;
		console.log('Leave', sessionId);
		this.state.removePlayer(sessionId);
		this.broadcast('receivetestchat', `${sessionId} left.`);
	}

	onDispose() {
		console.log('Room disposed');
	}

}
