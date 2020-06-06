import { Coord } from './BoardLayout';
import { Suspect } from './Consts';

export default function getInitialCoords(s: Suspect): Coord {
	switch (s) {
		case Suspect.BLOOD:
			return [22,6];
		case Suspect.EMERALD:
			return [0,15];
		case Suspect.PURPLE:
			return [18,21];
	}
}
