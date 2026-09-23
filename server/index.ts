import { WebSocketServer } from 'ws';

import { GameRoom } from '#server/GameRoom';

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
	const reconnectToken = url.searchParams.get('t');
	const existingRoom = roomId ? allRooms.get(roomId) : undefined;
	if (existingRoom) {
		existingRoom.playerConnected(ws, reconnectToken ?? undefined);
	} else {
		const room = new GameRoom(() => {
			allRooms.delete(room.id);
			console.log('Room cleaned up', room.id);
		});
		allRooms.set(room.id, room);
		console.log('Room created', room.id);

		room.playerConnected(ws);
	}
});
