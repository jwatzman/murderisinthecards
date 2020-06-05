import { $enum } from 'ts-enum-util';

import { Room } from './Consts';

export type Coord = [number, number];
type BoardConfig = {
	extent: Coord,
	rooms: {[r in Room]: {
		coords: [Coord, Coord],
		doors: Coord[],
	}},
};

export const BoardConfig: BoardConfig = {
	extent: [9,9],
	rooms: {
		[Room.GREENHOUSE]: {
			coords: [[0,0],[2,2]],
			doors: [[2,3]],
		},
		[Room.THEATER]: {
			coords: [[9,8],[9,9]],
			doors: [[9,7]],
		},
	},
};

type BoardSquare = Room | null;
type BoardLayout = BoardSquare[][];

function computeBoardLayout(): BoardLayout {
	const layout = [];
	const [maxX, maxY] = BoardConfig.extent;

	for (let x = 0; x <= maxX; x++) {
		const minor = [];
		for (let y = 0; y <= maxY; y++) {
			minor.push(computeBoardSquare(x, y));
		}

		layout.push(minor);
	}

	return layout;
}

function computeBoardSquare(x: number, y: number): BoardSquare {
	for (const roomName of $enum(Room).getValues()) {
		const roomConfig = BoardConfig.rooms[roomName];
		const [[minX,minY],[maxX,maxY]] = roomConfig.coords;

		if (x >= minX && y >= minY && x <= maxX && y <= maxY) {
			return roomName;
		}
	} 

	return null;
}

export const BoardLayout = computeBoardLayout();
