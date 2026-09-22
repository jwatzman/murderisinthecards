import { WebSocketServer } from 'ws';

import { GameRoom } from '#server/GameRoom';
import { newId } from '#server/newId';

const allRooms: Map<string, GameRoom> = new Map();

const port = Number(process.env.PORT || 2567);
const socketServer = new WebSocketServer({
	port,
	maxPayload: 1024 * 1024 * 1,
});

socketServer.on('listening', () => {
	console.log(`Listening on port ${port}`);
});

socketServer.on('connection', (ws, req) => {
	// Must immediately install an error handler; emitting an error event without
	// a handler will throw and kill the server.
	ws.on('error', (err) => console.error('WebSocket error', err));

	if (!req.url) {
		console.log('Rejecting connection: missing url');
		ws.terminate();
		return;
	}

	const url = new URL(req.url, 'http://invalid.example');
	if (url.pathname !== '/game/play') {
		console.log('Rejecting connection: invalid pathname', url.pathname);
		ws.terminate();
		return;
	}

	const roomId = url.searchParams.get('r');
	const existingRoom = roomId ? allRooms.get(roomId) : undefined;
	if (existingRoom) {
		existingRoom.playerConnected(ws);
	} else {
		const roomId = newId();
		const room = new GameRoom(roomId, () => {
			allRooms.delete(roomId);
			console.log('Room cleaned up', roomId);
		});
		allRooms.set(roomId, room);
		console.log('Room created', roomId);

		room.playerConnected(ws);
	}
});
