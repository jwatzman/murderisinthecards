import React from 'react';
import { $enum } from 'ts-enum-util';

import { Coord, BoardConfig } from './BoardLayout';
import { GameStateContext, SendMessageContext } from './Context';
import { ClientToServerMessage, Room } from './Consts';
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
	const sendMessage = React.useContext(SendMessageContext);

	const handleMoveToCoord = (coord: Coord) => (evt: React.SyntheticEvent) => {
		evt.preventDefault();
		// TODO: check move validity
		sendMessage(ClientToServerMessage.MOVE_TO_COORD, coord);
	};

	const handleMoveToRoom = (room: Room) => (evt: React.SyntheticEvent) => {
		evt.preventDefault();
		// TODO: check move validity
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
			squares.push(
				<div
					onClick={handleMoveToCoord([x,y])}
					className={Styles.square}
					style={squareStyle}
				/>
			);
		}
	}

	const rooms = [];
	for (const roomName of $enum(Room).getValues()) {
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
			rooms.push(
				<div
					onClick={handleMoveToCoord([x,y])}
					className={Styles.door}
					style={doorStyle}
				/>);
		}
	}

	return (
		<>
			{squares}
			{rooms}
		</>
	);
}

function Suspects() {
	const gameState = React.useContext(GameStateContext);

	const suspects = [];
	for (const playerId in gameState.players) {
		const playerState = gameState.players[playerId];

		let x, y;
		if (playerState.room) {
			// TODO: don't overlap >1 player in the same room
			const room = BoardConfig.rooms[playerState.room];
			[x,y] = room.coords[0];
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
			<div className={Styles.suspect} style={style}>{'\u265f'}</div>
		);
	}

	return <>{suspects}</>;
}
