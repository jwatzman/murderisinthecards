import React from 'react';

import DieRoll from './DieRoll';
import GameBoard from './GameBoard';
import GameMessages from './GameMessages';
import styles from './GamePlay.module.css';
import Notes from './Notes';
import TurnActions from './TurnActions';
import TurnOrder from './TurnOrder';
import YourCards from './YourCards';
import YourTurnWrap from './YourTurnWrap';

export default function GamePlay() {
	return (
		<YourTurnWrap>
			<div className={styles.wrap}>
				<GameBoard />
				<div className={styles.col}>
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
