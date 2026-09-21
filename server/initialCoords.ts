import type { Suspect } from '#common/cards';
import type { Coord } from '#common/layout';

export function getInitialCoords(s: Suspect): Coord {
	switch (s) {
		case 'Col. Blood':
			return [22, 6];
		case 'Ms. Emerald':
			return [0, 15];
		case 'Dr. Pepper':
			return [18, 21];
		case 'Rev. Sand':
			return [16, 0];
		case 'Mr. Silver':
			return [0, 6];
		case 'Ms. Violet':
			return [5, 21];
	}
}
