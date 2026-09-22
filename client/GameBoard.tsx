import React from 'react';

import {
	GameStateContext,
	PlayerIdContext,
	SendMessageContext,
} from '#client/Context';
import styles from '#client/GameBoard.module.css';
import { getSuspectColor } from '#client/SuspectColor';
import * as CanDo from '#common/canDo';
import type { Room } from '#common/cards';
import { allRooms } from '#common/cards';
import type { DoorDirection } from '#common/layout';
import { boardConfig } from '#common/layout';

export default function GameBoard() {
	return (
		<div className={styles.board}>
			<Squares />
			<Suspects />
		</div>
	);
}

function Squares() {
	const gameState = React.use(GameStateContext);
	const playerId = React.use(PlayerIdContext);
	const sendMessage = React.use(SendMessageContext);

	const handleMoveToCoord =
		(coord: [number, number]) => (evt: React.SyntheticEvent) => {
			evt.preventDefault();

			const err = CanDo.moveToCoord(playerId, gameState, coord);
			if (err !== null) {
				return;
			}

			sendMessage({ type: 'move_to_coord', coord });
		};

	const handleMoveToRoom = (room: Room) => (evt: React.SyntheticEvent) => {
		evt.preventDefault();

		const err = CanDo.moveToRoom(playerId, gameState, room);
		if (err !== null) {
			return;
		}

		sendMessage({ type: 'move_to_room', room });
	};

	const squares = [];
	const [maxX, maxY] = boardConfig.extent;
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
					onClick={handleMoveToCoord([x, y])}
					className={styles.square}
					style={squareStyle}
				/>,
			);
		}
	}

	const rooms = [];
	for (const roomName of allRooms) {
		const roomConfig = boardConfig.rooms[roomName];

		const [[minX, minY], [maxX, maxY]] = roomConfig.coords;
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
				className={styles.room}
				style={roomStyle}
			>
				{roomName}
			</div>,
		);

		for (const [[x, y], dir] of roomConfig.doors) {
			const doorStyle = {
				gridRowStart: x + 1,
				gridColumnStart: y + 1,
				...doorDirectionStyle(dir),
			};
			const doorKey = `d.x${x}y${y}`;
			rooms.push(
				<div
					key={doorKey}
					onClick={handleMoveToCoord([x, y])}
					className={styles.door}
					style={doorStyle}
				>
					{doorDirectionGlyph(dir)}
				</div>,
			);
		}
	}

	const [[voidMinX, voidMinY], [voidMaxX, voidMaxY]] = boardConfig.void;
	const voidStyle = {
		gridRowStart: voidMinX + 1,
		gridRowEnd: voidMaxX + 1 + 1,
		gridColumnStart: voidMinY + 1,
		gridColumnEnd: voidMaxY + 1 + 1,
	};
	const voidRoom = <div key="void" className={styles.void} style={voidStyle} />;

	return (
		<>
			{squares}
			{rooms}
			{voidRoom}
		</>
	);
}

function Suspects() {
	const gameState = React.use(GameStateContext);

	const suspects = [];
	const numSuspectsInRoom: { [r: string]: number } = {};
	for (const [playerId, playerState] of gameState.players.entries()) {
		if (playerState.eliminated) {
			continue;
		}

		let x, y;
		if (playerState.room) {
			const room = boardConfig.rooms[playerState.room];
			const nthInRoom = numSuspectsInRoom[playerState.room] || 0;

			const [[minX, minY], [, maxY]] = room.coords;

			x = minX;
			y = minY + nthInRoom;

			// Could be "while" instead of "if", but the smallest room is 4 wide, so
			// even all 6 suspects can still fit on two rows.
			if (y > maxY) {
				x++;
				y -= maxY - minY + 1;
			}

			numSuspectsInRoom[playerState.room] = nthInRoom + 1;
		} else {
			x = playerState.x;
			y = playerState.y;
		}

		const style = {
			color: getSuspectColor(playerState.suspect!),
			gridRowStart: x + 1,
			gridColumnStart: y + 1,
		};

		suspects.push(
			<div key={playerId} className={styles.suspect} style={style}>
				{'\u2666'}
			</div>,
		);
	}

	return <>{suspects}</>;
}

function doorDirectionGlyph(dir: DoorDirection): string {
	switch (dir) {
		case '+x': // "Down"
			return '\u2193';
		case '-x': // "Up"
			return '\u2191';
		case '+y': // "Right"
			return '\u2192';
		case '-y': // "Left"
			return '\u2190';
	}
}

function doorDirectionStyle(dir: DoorDirection): { [key: string]: string } {
	switch (dir) {
		case '+x': // "Down"
			return { alignItems: 'end' };
		case '-x': // "Up"
			return { alignItems: 'start' };
		case '+y': // "Right"
			return { justifyContent: 'end' };
		case '-y': // "Left"
			return { justifyContent: 'start' };
	}
}
