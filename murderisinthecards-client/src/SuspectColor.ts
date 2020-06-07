import { Suspect } from './Consts';

export default function getSuspectColor(s: Suspect): string {
	switch (s) {
		case Suspect.BLOOD:
			return 'red';
		case Suspect.EMERALD:
			return 'green';
		case Suspect.PURPLE:
			return 'purple';
	}
}
