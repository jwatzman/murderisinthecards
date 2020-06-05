import React from 'react';

import { BoardConfig, BoardLayout, Coord } from './BoardLayout';

import Styles from './GameBoard.module.css';

export default function GameBoard() {
	return (
		<div>
			<BaseBoard />
			<PlayerOverlays/>
		</div>
	);
}

function BaseBoard() {
	const rows = [];

	const [maxX, maxY] = BoardConfig.extent;
	for (let x = 0; x <= maxX; x++) {
		const cols = [];
		for (let y = 0; y <= maxY; y++) {
			cols.push(<BaseBoardSquare coord={[x,y]} />);
		}

		// XXX should this be a table?
		rows.push(<div>{cols}</div>);
	}

	return (
		<div className={Styles.board}>
			{rows}
		</div>
	);
}

type BaseBoardSquareProps = {coord: Coord}
function BaseBoardSquare({coord: [x,y]}: BaseBoardSquareProps) {
	const roomName = BoardLayout[x][y];
	if (roomName === null) {
		return <span className={Styles.square} />;
	}

	const roomConfig = BoardConfig.rooms[roomName];
	const [[minX,minY],[maxX,maxY]] = roomConfig.coords;

	let borders = {} as React.CSSProperties;
	if (x > minX) {
		borders.borderTopColor = 'lightblue';
	}
	if (y > minY) {
		borders.borderLeftColor = 'lightblue';
	}
	if (x < maxX) {
		borders.borderBottomColor = 'lightblue';
	}
	if (y < maxY) {
		borders.borderRightColor = 'lightblue';
	}

	const className = `${Styles.square} ${Styles.room}`;
	if (x === minX && y === minY) {
		return (
			<span className={className} style={borders}>
				<span className={Styles.roomLabel}>{roomName}</span>
			</span>
		);
	} else {
		return <span className={className} style={borders} />;
	}
}

function PlayerOverlays() {
	return null;
}
