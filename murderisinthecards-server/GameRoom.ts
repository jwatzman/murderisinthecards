import { Room, Client } from 'colyseus';

import { GameState } from './GameState';
import * as GameConfig from './GameConfig';

export class GameRoom extends Room<GameState> {

	onCreate(options: any): void {
		console.log('Room created', options);
		this.setState(new GameState());

		this.onMessage('sendtestchat', (client, message) => {
			const sessionId = client.sessionId;
			console.log('Got testchat from', sessionId, ':', message);
			this.state.messageReceived(sessionId);
			this.broadcast('receivetestchat', `${sessionId}: ${message}`);
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
