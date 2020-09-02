import { Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';

import { GameRoom } from './GameRoom';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
	server,
});

gameServer.define('murder', GameRoom);
app.use('/', express.static(path.join(__dirname, 'build')));

gameServer.listen(port);
console.log(`Listening on ws://localhost:${ port }`);
