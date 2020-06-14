import React from 'react';

import { Room, Suspect, Weapon } from 'murderisinthecards-common/Consts';

import { YourCardsContext } from './Context';

export default function YourCards() {
	const cards = React.useContext(YourCardsContext);

	const suspects = [];
	const weapons = [];
	const rooms = [];

	for (const card of cards) {
		if (Object.values(Suspect).includes(card as Suspect)) {
			suspects.push(card);
		} else if (Object.values(Weapon).includes(card as Weapon)) {
			weapons.push(card);
		} else if (Object.values(Room).includes(card as Room)) {
			rooms.push(card);
		}
	}

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
