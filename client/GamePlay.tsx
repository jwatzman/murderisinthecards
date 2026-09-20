import React from 'react';

import DieRoll from '#client/DieRoll';
import GameBoard from '#client/GameBoard';
import GameMessages from '#client/GameMessages';
import styles from '#client/GamePlay.module.css';
import Notes from '#client/Notes';
import TurnActions from '#client/TurnActions';
import TurnOrder from '#client/TurnOrder';
import YourCards from '#client/YourCards';
import YourTurnWrap from '#client/YourTurnWrap';

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
