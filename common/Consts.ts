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

/**
 * The game initially starts in SETUP, where the game hasn't really "begun";
 * players are allowed to connect and set a name+suspect.
 *
 * Once the game begins, each turn starts in BEGIN_TURN. You are allowed to
 * roll the die, use secret passages, or (if you were teleported via being
 * named in a suggestion on the last turn) make a suggestion. When you roll the
 * die, MOVEMENT phase begins; each move decrements the die count, and moving
 * into a room decrements immediately to zero. Once your count hits zero, if
 * you are in a room, you may make a suggestion. (Since suggestions cannot
 * normally be made during BEGIN_TURN, this is how making more than one
 * suggestion without moving is prevented. In fact, moving via secret passage
 * moves into MOVEMENT phase with a die roll of 0.) After making a suggestion,
 * SUGGESTION_RESOLUTION begins, at which point the player who needs to "do
 * something" is no longer the current player, but rather the player disproving
 * the suggestion. When the game is completely over and there are no more
 * turns, the game enters GAME_OVER.
 */
export enum PlayPhase {
	SETUP,
	BEGIN_TURN,
	MOVEMENT,
	SUGGESTION_RESOLUTION,
	GAME_OVER,
}

export enum ClientToServerMessage {
	PLAYER_SETUP = 'player_setup',
	BEGIN_GAME = 'begin_game',

	ROLL_DIE = 'roll_die',
	MOVE_TO_COORD = 'move_to_coord',
	MOVE_TO_ROOM = 'move_to_room',
	MOVE_THROUGH_PASSAGE = 'move_through_passage',

	MAKE_SUGGESTION = 'make_suggestion',
	DISPROVE_SUGGESTION = 'disprove_suggestion',

	MAKE_ACCUSATION = 'make_accusation',

	END_TURN = 'end_turn',
}

export enum ServerToClientMessage {
	GAME_MESSAGE = 'game_message',
	YOUR_CARDS = 'your_cards',
}
