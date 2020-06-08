import { $enum } from 'ts-enum-util';

import { Room } from './Consts';

export type Coord = readonly [number, number];
type BoardConfig = {
	readonly extent: Coord,
	readonly rooms: {[r in Room]: {
		readonly coords: readonly [Coord, Coord],
		readonly doors: readonly Coord[],
	}},
};

export const BoardConfig: BoardConfig = {
	extent: [22,21],
	rooms: {
		[Room.DINING_ROOM]: {
			coords: [[9,0],[14,6]],
			doors: [[11,7],[15,5]],
		},
		[Room.FOYER]: {
			coords: [[17,8],[22,13]],
			doors: [[16,10],[16,11]],
		},
		[Room.GAME_ROOM]: {
			coords: [[7,17],[11,21]],
			doors: [[8,16],[12,21]],
		},
		[Room.GREENHOUSE]: {
			coords: [[0,18],[4,21]],
			doors: [[4,17]],
		},
		[Room.KITCHEN]: {
			coords: [[0,0],[5,4]],
			doors: [[6,3]],
		},
		[Room.LIBRARY]: {
			coords: [[13,16],[17,21]],
			doors: [[12,19],[15,15]],
		},
		[Room.LOUNGE]: {
			coords: [[18,0],[22,5]],
			doors: [[17,5]],
		},
		[Room.STUDY]: {
			coords: [[20,16],[22,21]],
			doors: [[19,16]],
		},
		[Room.THEATER]: {
			coords: [[0,7],[6,14]],
			doors: [[4,6],[7,8],[7,13],[4,15]],
		},
	},
} as const;

type BoardSquare = Room | null;
type BoardLayout = readonly BoardSquare[][];

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
