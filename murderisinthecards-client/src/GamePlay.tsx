import React from 'react';

import DieRoll from './DieRoll';
import GameBoard from './GameBoard';
import GameMessages from './GameMessages';
import TurnActions from './TurnActions';
import TurnOrder from './TurnOrder';
import YourCards from './YourCards';

import Styles from './GamePlay.module.css';

export default function GamePlay() {
	// TODO: add notes textarea, saved to localstorage
	return (
		<>
			<div className={Styles.wrap}>
				<GameBoard />
				<div className={Styles.col}>
					<div>
						<TurnOrder />
						<YourCards />
						<DieRoll />
						<TurnActions />
					</div>
					<GameMessages />
				</div>
			</div>
		</>
	);
}
