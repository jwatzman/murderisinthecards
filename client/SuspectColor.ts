import { Suspect } from 'common/Consts';

export default function getSuspectColor(s: Suspect): string {
	switch (s) {
		case Suspect.BLOOD:
			return 'red';
		case Suspect.EMERALD:
			return 'green';
		case Suspect.PEPPER:
			return 'black';
		case Suspect.SAND:
			return 'yellow';
		case Suspect.SILVER:
			return 'white';
		case Suspect.VIOLET:
			return 'blue';
	}
}
