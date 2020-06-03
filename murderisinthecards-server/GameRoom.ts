import { Room, Client } from 'colyseus';

import { GameState } from './GameState';
import { ClientToServerMessage, PlayPhase } from './Consts';

export class GameRoom extends Room<GameState> {

	onCreate(): void {
		console.log('Room created');
		this.setState(new GameState());

		this.onMessage(ClientToServerMessage.PLAYER_SETUP, (client, {name,suspect}) => {
			const sessionId = client.sessionId;
			console.log('Player setup', sessionId, name, suspect);

			if (this.state.phase != PlayPhase.SETUP) {
				client.error(
					null,
					'You can\'t select a name and suspect after the game has started!',
				);
				return;
			}

			// TODO: remove this restriction?
			const player = this.state.getPlayer(sessionId);
			if (player.name && player.suspect) {
				client.error(null, 'You\'ve already selected a name and suspect!');
				return;
			}

			for (const otherPlayer of this.state.getAllPlayers()) {
				if (otherPlayer.suspect == suspect) {
					client.error(null, otherPlayer.name + ' already is ' + suspect);
					return;
				}
			}

			player.name = name;
			player.suspect = suspect;
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
