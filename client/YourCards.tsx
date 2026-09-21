import React from 'react';

import { YourCardsContext } from '#client/Context';
import type { Card } from '#common/cards';
import { allRooms, allSuspects, allWeapons } from '#common/cards';

export default function YourCards() {
	return (
		<div>
			Your cards:
			<ul>
				<CardsLine src={allSuspects} />
				<CardsLine src={allWeapons} />
				<CardsLine src={allRooms} />
			</ul>
		</div>
	);
}

function CardsLine({ src }: { src: readonly Card[] }) {
	const cards = React.use(YourCardsContext);

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
