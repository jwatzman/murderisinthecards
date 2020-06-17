import React from 'react';

import { Coord, BoardConfig } from 'murderisinthecards-common/BoardLayout';
import * as CanDo from 'murderisinthecards-common/CanDo';
import {
	ClientToServerMessage, Room
} from 'murderisinthecards-common/Consts';

import {
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
} from './Context';
import getSuspectColor from './SuspectColor';

import Styles from './GameBoard.module.css';

export default function GameBoard() {
	return (
		<div className={Styles.board}>
			<Squares />
			<Suspects />
		</div>
	);
}

function Squares() {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);
	const sendMessage = React.useContext(SendMessageContext);

	const handleMoveToCoord = (coord: Coord) => (evt: React.SyntheticEvent) => {
		evt.preventDefault();

		const err = CanDo.moveToCoord(sessionId, gameState, coord);
		if (err != null) {
			return;
		}

		sendMessage(ClientToServerMessage.MOVE_TO_COORD, coord);
	};

	const handleMoveToRoom = (room: Room) => (evt: React.SyntheticEvent) => {
		evt.preventDefault();

		const err = CanDo.moveToRoom(sessionId, gameState, room);
		if (err != null) {
			return;
		}

		sendMessage(ClientToServerMessage.MOVE_TO_ROOM, room);
	};

	const squares = [];
	const [maxX, maxY] = BoardConfig.extent;
	for (let x = 0; x <= maxX; x++) {
		for (let y = 0; y <= maxY; y++) {
			const squareStyle = {
				gridRowStart: x + 1,
				gridColumnStart: y + 1,
			};
			const squareKey = `sq.x${x}y${y}`;
			squares.push(
				<div
					key={squareKey}
					onClick={handleMoveToCoord([x,y])}
					className={Styles.square}
					style={squareStyle}
				/>
			);
		}
	}

	const rooms = [];
	for (const roomName of Object.values(Room)) {
		const roomConfig = BoardConfig.rooms[roomName];

		const [[minX,minY],[maxX,maxY]] = roomConfig.coords;
		const roomStyle = {
			gridRowStart: minX + 1,
			gridRowEnd: maxX + 1 + 1,
			gridColumnStart: minY + 1,
			gridColumnEnd: maxY + 1 + 1,
		};
		rooms.push(
			<div
				key={roomName}
				onClick={handleMoveToRoom(roomName)}
				className={Styles.room}
				style={roomStyle}>
				{roomName}
			</div>
		);

		for (const [x,y] of roomConfig.doors) {
			const doorStyle = {
				gridRowStart: x + 1,
				gridColumnStart: y + 1,
			};
			const doorKey = `d.x${x}y${y}`;
			rooms.push(
				<div
					key={doorKey}
					onClick={handleMoveToCoord([x,y])}
					className={Styles.door}
					style={doorStyle}
				/>);
		}
	}

	const [[voidMinX,voidMinY],[voidMaxX,voidMaxY]] = BoardConfig.void;
	const voidStyle = {
		gridRowStart: voidMinX + 1,
		gridRowEnd: voidMaxX + 1 + 1,
		gridColumnStart: voidMinY + 1,
		gridColumnEnd: voidMaxY + 1 + 1,
	};
	const voidRoom =
		<div key="void" className={Styles.void} style={voidStyle} />;

	return (
		<>
			{squares}
			{rooms}
			{voidRoom}
		</>
	);
}

function Suspects() {
	const gameState = React.useContext(GameStateContext);

	const suspects = [];
	const numSuspectsInRoom: {[r: string]: number} = {};
	for (const playerId in gameState.players) {
		const playerState = gameState.players[playerId];
		if (playerState.eliminated) {
			continue;
		}

		let x, y;
		if (playerState.room) {
			const room = BoardConfig.rooms[playerState.room];
			const nthInRoom = numSuspectsInRoom[playerState.room] || 0;

			const [[minX,minY],[,maxY]] = room.coords;

			x = minX;
			y = minY + nthInRoom;

			// Could be "while" instead of "if", but the smallest room is 4 wide, so
			// even all 6 suspects can still fit on two rows.
			if (y > maxY) {
				x++;
				y -= (maxY - minY + 1);
			}

			numSuspectsInRoom[playerState.room] = nthInRoom + 1;
		} else {
			x = playerState.x;
			y = playerState.y;
		}

		const style = {
			color: getSuspectColor(playerState.suspect),
			gridRowStart: x + 1,
			gridColumnStart: y + 1,
		};

		suspects.push(
			<div
				key={playerId}
				className={Styles.suspect}
				style={style}>
				{'\u2666'}
			</div>
		);
	}

	return <>{suspects}</>;
}
