import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import cors from 'cors';
import express from 'express';
import http from 'http';

import { GameRoom } from './GameRoom';

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
	greet: false,
	transport: new WebSocketTransport({
		server: http.createServer(app),
	}),
});

gameServer.define('murder', GameRoom);

const port = Number(process.env.PORT || 2567);
void gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
