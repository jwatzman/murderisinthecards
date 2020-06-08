import { Coord } from 'murderisinthecards-common/BoardLayout';
import { Suspect } from 'murderisinthecards-common/Consts';

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
