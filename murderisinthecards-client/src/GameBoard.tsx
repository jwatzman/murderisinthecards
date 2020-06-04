import React from 'react';
import { $enum } from 'ts-enum-util';

import { BoardConfig, Coord, Room } from './Consts';

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
	for (var x = 0; x <= maxX; x++) {
		const cols = [];
		for (var y = 0; y <= maxY; y++) {
			cols.push(<BaseBoardSquae coord={[x,y]} />);
		}

		rows.push(<div>{cols}</div>);
	}

	return (
		<div className={Styles.board}>
			{rows}
		</div>
	);
}

type BaseBoardSquareProps = {coord: Coord}
function BaseBoardSquae({coord: [x,y]}: BaseBoardSquareProps) {
	// This is pretty inefficient, but I guess is fine?
	for (const roomName of $enum(Room).getValues()) {
		const roomConfig = BoardConfig.rooms[roomName];
		const [[minX,minY],[maxX,maxY]] = roomConfig.coords;

		if (x >= minX && y >= minY && x <= maxX && y <= maxY) {
			var borders = {} as React.CSSProperties;
			if (x === minX) {
				borders.borderTopColor = 'black';
			}
			if (y === minY) {
				borders.borderLeftColor = 'black';
			}
			if (x === maxX) {
				borders.borderBottomColor = 'black';
			}
			if (y === maxY) {
				borders.borderRightColor = 'black';
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
	}

	return <span className={Styles.square} />;
}

function PlayerOverlays() {
	return null;
}
