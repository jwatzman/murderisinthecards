import React from 'react';

import { GameMessagesContext } from './Context';

export default function GameMessages() {
	const messages = React.useContext(GameMessagesContext);

	return (
		<div>
			<ul>
				{messages.map(m => <li>{m}</li>).reverse()}
			</ul>
		</div>
	);
}
