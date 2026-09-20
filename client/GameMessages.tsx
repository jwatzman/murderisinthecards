import React from 'react';

import { GameMessagesContext } from '#client/Context';

export default function GameMessages() {
	const messages = React.use(GameMessagesContext);

	return (
		<div>
			Log:
			<ul>
				{messages.map((m) => (
					<li key={m.id}>{m.message}</li>
				))}
			</ul>
		</div>
	);
}
