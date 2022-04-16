import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';

import { GameRoom } from './GameRoom';

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
	transport: new WebSocketTransport({
		server: http.createServer(app),
	}),
});

gameServer.define('murder', GameRoom);

if (process.env.SERVE_STATIC !== '0') {
	app.use('/', express.static(path.join(__dirname, 'build')));
}

const port = Number(process.env.PORT || 2567);
gameServer.listen(port);
console.log(`Listening on ws://localhost:${ port }`);
