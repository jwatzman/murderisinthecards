import type { Suspect } from '#common/cards';

export function getSuspectColor(s: Suspect): string {
	switch (s) {
		case 'Col. Blood':
			return 'red';
		case 'Ms. Emerald':
			return 'green';
		case 'Dr. Pepper':
			return 'black';
		case 'Rev. Sand':
			return 'yellow';
		case 'Mr. Silver':
			return 'white';
		case 'Ms. Violet':
			return 'blue';
	}
}
