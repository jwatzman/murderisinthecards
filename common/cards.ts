export const allSuspects = [
	'Col. Blood',
	'Ms. Emerald',
	'Dr. Pepper',
	'Rev. Sand',
	'Mr. Silver',
	'Ms. Violet',
] as const;
export type Suspect = (typeof allSuspects)[number];

export const allWeapons = [
	'AK-47',
	'Candlestick',
	'Golf Club',
	'Hammer',
	'Letter Opener',
	'Necktie',
] as const;
export type Weapon = (typeof allWeapons)[number];

export const allRooms = [
	'Dining Room',
	'Foyer',
	'Game Room',
	'Greenhouse',
	'Kitchen',
	'Library',
	'Lounge',
	'Study',
	'Theater',
] as const;
export type Room = (typeof allRooms)[number];

export type Card = Suspect | Weapon | Room;
