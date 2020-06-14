export enum Suspect {
	BLOOD = 'Col. Blood', // Scarlett
	EMERALD = 'Ms. Emerald', // Green
	PEPPER = 'Dr. Pepper', // Plum
	SAND = 'Rev. Sand', // Mustard
	SILVER = 'Mr. Silver', // White
	VIOLET = 'Ms. Violet', // Peacock
}

export enum Weapon {
	AK47 = 'AK-47',
	CANDLESTICK = 'Candlestick',
	GOLF_CLUB = 'Golf Club',
	HAMMER = 'Hammer',
	LETTER_OPENER = 'Letter Opener',
	NECKTIE = 'Necktie',
}

export enum Room {
	DINING_ROOM = 'Dining Room',
	FOYER = 'Foyer',
	GAME_ROOM = 'Game Room',
	GREENHOUSE = 'Greenhouse',
	KITCHEN = 'Kitchen',
	LIBRARY = 'Library',
	LOUNGE = 'Lounge',
	STUDY = 'Study',
	THEATER = 'Theater',
}

export type Card = Suspect | Weapon | Room;
export type Solution = [Suspect, Weapon, Room];

export enum PlayPhase {
	SETUP,
	BEGIN_TURN,
	MOVEMENT,
	SUGGESTION_RESOLUTION,
}

export enum ClientToServerMessage {
	PLAYER_SETUP = 'player_setup',
	BEGIN_GAME = 'begin_game',

	ROLL_DIE = 'roll_die',
	MOVE_TO_COORD = 'move_to_coord',
	MOVE_TO_ROOM = 'move_to_room',

	MAKE_SUGGESTION = 'make_suggestion',
	DISPROVE_SUGGESTION = 'disprove_suggestion',

	END_TURN = 'end_turn',
}

export enum ServerToClientMessage {
	GAME_MESSAGE = 'game_message',
	YOUR_CARDS = 'your_cards',
}
