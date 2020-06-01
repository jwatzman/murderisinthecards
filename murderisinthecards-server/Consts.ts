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
	LIBRARY = 'Library',
	KITCHEN = 'Kitchen',
}

export enum PlayPhase {
	SETUP,
	MOVEMENT,
	SUGGESTION_RESOLUTION,
}

export enum ClientToServerMessage {
	SELECT_SUSPECT = 'select_suspect',
	SET_NAME = 'set_name',
	BEGIN_GAME = 'begin_game',
}
