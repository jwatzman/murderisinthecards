import { css, cx } from '@emotion/css';
import React from 'react';

import type { Coord } from 'common/BoardLayout';
import { BoardConfig, DoorDirection } from 'common/BoardLayout';
import * as CanDo from 'common/CanDo';
import { ClientToServerMessage, Room } from 'common/Consts';

import {
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
} from './Context';
import getSuspectColor from './SuspectColor';

const GRID_SIZE = '30px';
const centerText = css({
	cursor: 'default',
	display: 'flex',
	'align-items': 'center',
	'justify-content': 'center',
});

export default function GameBoard() {
	return (
		<div
			className={css({
				border: '3px solid black',
				display: 'inline-grid',
				'grid-template-rows': `repeat(${
					BoardConfig.extent[0] + 1
				}, ${GRID_SIZE})`,
				'grid-template-columns': `repeat(${
					BoardConfig.extent[1] + 1
				}, ${GRID_SIZE})`,
			})}
		>
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
					onClick={handleMoveToCoord([x, y])}
					className={css({
						'background-color': 'lightyellow',
						border: '1px solid black',
						'grid-row-end': 'span 1',
						'grid-column-end': 'span 1',
					})}
					style={squareStyle}
				/>,
			);
		}
	}

	const rooms = [];
	for (const roomName of Object.values(Room)) {
		const roomConfig = BoardConfig.rooms[roomName];

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
				className={cx(
					centerText,
					css({
						'background-color': 'darkkhaki',
						border: '1px solid darkred',
					}),
				)}
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
					className={cx(
						centerText,
						css({
							'background-color': 'yellow',
							border: '1px solid black',
							'font-size': `calc(${GRID_SIZE} / 2)`,
							'font-weight': 'bold',
							'grid-row-end': 'span 1',
							'grid-column-end': 'span 1',
						}),
					)}
					style={doorStyle}
				>
					{doorDirectionGlyph(dir)}
				</div>,
			);
		}
	}

	const [[voidMinX, voidMinY], [voidMaxX, voidMaxY]] = BoardConfig.void;
	const voidStyle = {
		gridRowStart: voidMinX + 1,
		gridRowEnd: voidMaxX + 1 + 1,
		gridColumnStart: voidMinY + 1,
		gridColumnEnd: voidMaxY + 1 + 1,
	};
	const voidRoom = (
		<div
			key="void"
			className={css({
				'background-color': 'lightyellow',
				border: '1px solid black',
			})}
			style={voidStyle}
		/>
	);

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
	const numSuspectsInRoom: { [r: string]: number } = {};
	for (const [playerId, playerState] of gameState.players.entries()) {
		if (playerState.eliminated) {
			continue;
		}

		let x, y;
		if (playerState.room) {
			const room = BoardConfig.rooms[playerState.room];
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
			color: getSuspectColor(playerState.suspect),
			gridRowStart: x + 1,
			gridColumnStart: y + 1,
		};

		suspects.push(
			<div
				key={playerId}
				className={cx(
					centerText,
					css({
						'grid-row-end': 'span 1',
						'grid-column-end': 'span 1',
						'font-size': `${GRID_SIZE}`,

						'-webkit-text-stroke': '1px black',
						'text-stroke': '1px black',
					}),
				)}
				style={style}
			>
				{'\u2666'}
			</div>,
		);
	}

	return <>{suspects}</>;
}

function doorDirectionGlyph(dir: DoorDirection): string {
	switch (dir) {
		case DoorDirection.POS_X: // "Down"
			return '\u2193';
		case DoorDirection.NEG_X: // "Up"
			return '\u2191';
		case DoorDirection.POS_Y: // "Right"
			return '\u2192';
		case DoorDirection.NEG_Y: // "Left"
			return '\u2190';
	}
}

function doorDirectionStyle(dir: DoorDirection): { [key: string]: string } {
	switch (dir) {
		case DoorDirection.POS_X: // "Down"
			return { alignItems: 'end' };
		case DoorDirection.NEG_X: // "Up"
			return { alignItems: 'start' };
		case DoorDirection.POS_Y: // "Right"
			return { justifyContent: 'end' };
		case DoorDirection.NEG_Y: // "Left"
			return { justifyContent: 'start' };
	}
}
