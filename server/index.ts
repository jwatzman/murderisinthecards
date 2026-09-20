import http from 'http';

import { Server, createRouter } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';

import { GameRoom } from '#server/GameRoom';

const gameServer = new Server({
	greet: false,
	transport: new WebSocketTransport({
		server: http.createServer(),
	}),
});

gameServer.router = createRouter({}, { basePath: '/game' });

gameServer.define('murder', GameRoom);

const port = Number(process.env.PORT || 2567);
void gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
