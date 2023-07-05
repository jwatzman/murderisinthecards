import React from 'react';

import type { Card } from 'common/Consts';
import { Room, Suspect, Weapon } from 'common/Consts';

import { YourCardsContext } from './Context';

export default function YourCards() {
	return (
		<div>
			Your cards:
			<ul>
				<CardsLine src={Object.values(Suspect)} />
				<CardsLine src={Object.values(Weapon)} />
				<CardsLine src={Object.values(Room)} />
			</ul>
		</div>
	);
}

function CardsLine({ src }: { src: Card[] }) {
	const cards = React.useContext(YourCardsContext);

	// This is a somewhat inefficient way to deal with this, but it's simple,
	// preserves the types, and keeps the cards displayed in the UI in a
	// consistent order. There aren't enough cards in the game for the
	// inefficiency to really matter.
	const filtered: Card[] = [];
	for (const elem of src) {
		if (cards.includes(elem)) {
			filtered.push(elem);
		}
	}

	if (filtered.length > 0) {
		return <li>{filtered.join(', ')}</li>;
	} else {
		return null;
	}
}
