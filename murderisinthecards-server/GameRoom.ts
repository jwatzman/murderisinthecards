import { Room, Client } from 'colyseus';

import { GameState } from './GameState';
import { ClientToServerMessage } from './Consts';

export class GameRoom extends Room<GameState> {

	onCreate(): void {
		console.log('Room created');
		this.setState(new GameState());

		this.onMessage(ClientToServerMessage.PLAYER_SETUP, (client, {name,suspect}) => {
			// TODO assert phase is setup
			// TODO assert no other player picked this suspect
			const sessionId = client.sessionId;
			console.log('Player setup', sessionId, name, suspect);

			const player = this.state.getPlayer(sessionId);
			player.setName(name);
			player.setSuspect(suspect);
		});

	}

	onJoin(client: Client): void {
		const sessionId = client.sessionId;
		console.log('Join', sessionId);
		this.state.createPlayer(sessionId);
	}

	onLeave(client: Client, _consented: boolean): void {
		const sessionId = client.sessionId;
		console.log('Leave', sessionId);
		this.state.removePlayer(sessionId);
	}

	onDispose(): void {
		console.log('Room disposed');
	}

}
