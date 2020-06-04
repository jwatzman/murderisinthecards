export enum Suspect {
	BLOOD = 'Mr. Blood',
	EMERALD = 'Mrs. Emerald',
	PRUPLE = 'Dr. Purple',
}

export enum Weapon {
	LETTER_OPENER = 'Letter Opener',
	PISTOL = 'Pistol',
	NECKTIE = 'Necktie',
}

export enum Room {
	GREENHOUSE = 'Greenhouse',
	THEATER = 'Theater',
	//LIBRARY = 'Library',
	//KITCHEN = 'Kitchen',
}

export enum PlayPhase {
	SETUP,
	BEGIN_TURN,
	MOVEMENT,
	SUGGESTION_RESOLUTION,
}

export enum ClientToServerMessage {
	PLAYER_SETUP = 'player_setup',
	BEGIN_GAME = 'begin_game',
}

export type Coord = [number, number];
type BoardConfigT = {
	extent: Coord,
	rooms: {[r in Room]: {
		coords: [Coord, Coord],
		doors: Coord[],
	}},
};

export const BoardConfig: BoardConfigT = {
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
