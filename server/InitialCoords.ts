import { Coord } from 'common/BoardLayout';
import { Suspect } from 'common/Consts';

export default function getInitialCoords(s: Suspect): Coord {
	switch (s) {
		case Suspect.BLOOD:
			return [22,6];
		case Suspect.EMERALD:
			return [0,15];
		case Suspect.PEPPER:
			return [18, 21];
		case Suspect.SAND:
			return [16, 0];
		case Suspect.SILVER:
			return [0, 6];
		case Suspect.VIOLET:
			return [5, 21];
	}
}
