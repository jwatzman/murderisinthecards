import { Room, Client } from 'colyseus';

import { GameState } from './GameState';
import { ClientToServerMessage } from './Consts';

export class GameRoom extends Room<GameState> {

	onCreate(options: any): void {
		console.log('Room created', options);
		this.setState(new GameState());

		this.onMessage(ClientToServerMessage.SELECT_SUSPECT, (client, suspect) => {
			// TODO assert phase is setup
			// TODO assert no other player picked this suspect
			const sessionId = client.sessionId;
			console.log('Select suspect', sessionId, suspect);
			this.state.getPlayer(sessionId).selectSuspect(suspect);
		});

		this.onMessage(ClientToServerMessage.SET_NAME, (client, name) => {
			// TODO assert phase is setup
			const sessionId = client.sessionId;
			console.log('Set name', sessionId, name);
			this.state.getPlayer(sessionId).setName(name);
		});

	}

	onJoin(client: Client, _options: any): void {
		const sessionId = client.sessionId;
		console.log('Join', sessionId);
		this.state.createPlayer(sessionId);
		this.broadcast('receivetestchat', `${sessionId} joined.`);
	}

	onLeave(client: Client, _consented: boolean): void {
		const sessionId = client.sessionId;
		console.log('Leave', sessionId);
		this.state.removePlayer(sessionId);
		this.broadcast('receivetestchat', `${sessionId} left.`);
	}

	onDispose(): void {
		console.log('Room disposed');
	}

}
