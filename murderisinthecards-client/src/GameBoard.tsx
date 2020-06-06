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
		const [[minX,minY],[maxX,maxY]] = BoardConfig.rooms[roomName].coords;
		const roomStyle = {
			gridRowStart: minX + 1,
			gridRowEnd: maxX + 1 + 1,
			gridColumnStart: minY + 1,
			gridColumnEnd: maxY + 1 + 1,
		};
		rooms.push(
			<div className={Styles.room} style={roomStyle}>{roomName}</div>
		);
	}

	return <>{rooms}</>;
}
