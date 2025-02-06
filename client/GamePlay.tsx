import { css } from '@emotion/css';
import React from 'react';

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
			<div className={css({ display: 'flex', marginBottom: '20px' })}>
				<GameBoard />
				<div
					className={css({
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						marginLeft: '20px',
						minWidth: '250px',
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
