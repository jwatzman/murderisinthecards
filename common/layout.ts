import type { Room } from '#common/cards';
import { allRooms } from '#common/cards';

export type DoorDirection = '+x' | '-x' | '+y' | '-y';

export type Coord = readonly [number, number];
type BoardConfig = {
	readonly extent: Coord;
	readonly rooms: {
		[r in Room]: {
			readonly coords: readonly [Coord, Coord];
			readonly doors: readonly (readonly [Coord, DoorDirection])[];
			readonly passage?: Room;
		};
	};
	readonly void: readonly [Coord, Coord];
};

export const boardConfig: BoardConfig = {
	extent: [22, 21],
	rooms: {
		['Dining Room']: {
			coords: [
				[9, 0],
				[14, 6],
			],
			doors: [
				[[11, 7], '-y'],
				[[15, 5], '-x'],
			],
		},
		['Foyer']: {
			coords: [
				[17, 8],
				[22, 13],
			],
			doors: [
				[[16, 10], '+x'],
				[[16, 11], '+x'],
			],
		},
		['Game Room']: {
			coords: [
				[7, 17],
				[11, 21],
			],
			doors: [
				[[8, 16], '+y'],
				[[12, 21], '-x'],
			],
		},
		['Greenhouse']: {
			coords: [
				[0, 18],
				[4, 21],
			],
			doors: [[[4, 17], '+y']],
			passage: 'Lounge',
		},
		['Kitchen']: {
			coords: [
				[0, 0],
				[5, 4],
			],
			doors: [[[6, 3], '-x']],
			passage: 'Study',
		},
		['Library']: {
			coords: [
				[13, 16],
				[17, 21],
			],
			doors: [
				[[12, 19], '+x'],
				[[15, 15], '+y'],
			],
		},
		['Lounge']: {
			coords: [
				[18, 0],
				[22, 5],
			],
			doors: [[[17, 5], '+x']],
			passage: 'Greenhouse',
		},
		['Study']: {
			coords: [
				[20, 16],
				[22, 21],
			],
			doors: [[[19, 16], '+x']],
			passage: 'Kitchen',
		},
		['Theater']: {
			coords: [
				[0, 7],
				[6, 14],
			],
			doors: [
				[[4, 6], '+y'],
				[[7, 8], '-x'],
				[[7, 13], '-x'],
				[[4, 15], '-y'],
			],
		},
	},
	void: [
		[9, 9],
		[15, 13],
	],
} as const;

type BoardSquare = Room | 'VOID' | null;
type BoardLayout = readonly BoardSquare[][];

function computeBoardLayout(): BoardLayout {
	const layout = [];
	const [maxX, maxY] = boardConfig.extent;

	for (let x = 0; x <= maxX; x++) {
		const minor: BoardSquare[] = [];
		for (let y = 0; y <= maxY; y++) {
			minor.push(computeBoardSquare(x, y));
		}

		layout.push(minor);
	}

	return layout;
}

function computeBoardSquare(x: number, y: number): BoardSquare {
	for (const roomName of allRooms) {
		const roomConfig = boardConfig.rooms[roomName];
		const [[minX, minY], [maxX, maxY]] = roomConfig.coords;

		if (x >= minX && y >= minY && x <= maxX && y <= maxY) {
			return roomName;
		}
	}

	const [[voidMinX, voidMinY], [voidMaxX, voidMaxY]] = boardConfig.void;
	if (x >= voidMinX && y >= voidMinY && x <= voidMaxX && y <= voidMaxY) {
		return 'VOID';
	}

	return null;
}

export const boardLayout = computeBoardLayout();
