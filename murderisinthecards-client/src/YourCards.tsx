import React from 'react';

import { YourCardsContext } from './Context';

export default function YourCards() {
	const cards = React.useContext(YourCardsContext);
	return (
		<div>
			Your cards: {cards.join(', ')}
		</div>
	);
}
