import React from 'react';

import {
	Card,
	Room,
	Suspect,
	Weapon
} from 'murderisinthecards-common/Consts';

import { YourCardsContext } from './Context';

export default function YourCards() {
	const cards = React.useContext(YourCardsContext);

	const suspects: Suspect[] = [];
	const weapons: Weapon[] = [];
	const rooms: Room[] = [];

	const checkAndPush = <T extends Card>(src: T[], target: T[]) => {
		for (const elem of src) {
			if (cards.includes(elem)) {
				target.push(elem);
			}
		}
	};

	// This is a somewhat inefficient way to deal with this, but it's simple,
	// preserves the types, and keeps the cards displayed in the UI in a
	// consistent order. There aren't enough cards in the game for the
	// inefficiency to really matter.
	checkAndPush(Object.values(Suspect), suspects);
	checkAndPush(Object.values(Weapon), weapons);
	checkAndPush(Object.values(Room), rooms);

	return (
		<div>
			Your cards:
			<ul>
				<li>{suspects.join(', ')}</li>
				<li>{weapons.join(', ')}</li>
				<li>{rooms.join(', ')}</li>
			</ul>
		</div>
	);
}
