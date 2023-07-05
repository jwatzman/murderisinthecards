import React from 'react';
import { css } from '@emotion/css';

import DieRoll from './DieRoll';
import GameBoard from './GameBoard';
import GameMessages from './GameMessages';
import Notes from './Notes';
import TurnActions from './TurnActions';
import TurnOrder from './TurnOrder';
import YourCards from './YourCards';
import YourTurnWrap from './YourTurnWrap';

export default function GamePlay() {
	return (
		<YourTurnWrap>
			<div className={css({ display: 'flex', 'margin-bottom': '20px' })}>
				<GameBoard />
				<div
					className={css({
						display: 'flex',
						'flex-direction': 'column',
						'justify-content': 'space-between',
						'margin-left': '20px',
						'min-width': '250px',
					})}
				>
					<div>
						<TurnOrder />
						<YourCards />
						<DieRoll />
						<TurnActions />
					</div>
					<GameMessages />
				</div>
			</div>
			<Notes />
		</YourTurnWrap>
	);
}
