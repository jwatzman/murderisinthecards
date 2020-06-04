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
	BEGIN_TURN,
	MOVEMENT,
	SUGGESTION_RESOLUTION,
}

export enum ClientToServerMessage {
	PLAYER_SETUP = 'player_setup',
	BEGIN_GAME = 'begin_game',
}
