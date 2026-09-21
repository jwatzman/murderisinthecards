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
export const allPlayPhases = [
	'SETUP',
	'BEGIN_TURN',
	'MOVEMENT',
	'SUGGESTION_RESOLUTION',
	'GAME_OVER',
] as const;
export type PlayPhase = (typeof allPlayPhases)[number];
