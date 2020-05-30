import { Room, Client } from "colyseus";

export class MyRoom extends Room {

	onCreate (options: any) {
		console.log('Room created', options);

		this.onMessage("sendtestchat", (client, message) => {
			const sessionId = client.sessionId;
			console.log('Got testchat from', sessionId, ':', message);
			this.broadcast('receivetestchat', `${sessionId}: ${message}`);
		});

	}

	onJoin (client: Client, options: any) {
		const sessionId = client.sessionId;
		console.log('Join', sessionId);
		this.broadcast('receivetestchat', `${sessionId} joined.`);
	}

	onLeave (client: Client, consented: boolean) {
		const sessionId = client.sessionId;
		console.log('Leave', sessionId);
		this.broadcast('receivetestchat', `${sessionId} left.`);
	}

	onDispose() {
		console.log('Room disposed');
	}

}
