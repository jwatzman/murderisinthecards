import React from 'react';
import { $enum } from 'ts-enum-util';

import { BoardConfig  } from './BoardLayout';
import { Room } from './Consts';

import Styles from './GameBoard.module.css';

export default function GameBoard() {
	return (
		<div className={Styles.board}>
			<Squares />
			<Rooms />
		</div>
	);
}

function Squares() {
	const squares = [];

	const [maxX, maxY] = BoardConfig.extent;
	for (let x = 0; x <= maxX; x++) {
		for (let y = 0; y <= maxY; y++) {
			const squareStyle = {
				gridRowStart: x + 1,
				gridColumnStart: y + 1,
			};
			squares.push(<div className={Styles.square} style={squareStyle} />);
		}
	}

	return <>{squares}</>;
}

function Rooms() {
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
			<div className={Styles.room} style={roomStyle}>{roomName}</div>
		);

		for (const [x,y] of roomConfig.doors) {
			const doorStyle = {
				gridRowStart: x + 1,
				gridColumnStart: y + 1,
			};
			rooms.push(<div className={Styles.door} style={doorStyle} />);
		}
	}

	return <>{rooms}</>;
}
