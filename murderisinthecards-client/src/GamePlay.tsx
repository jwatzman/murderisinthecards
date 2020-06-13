import React from 'react';

import DieRoll from './DieRoll';
import GameBoard from './GameBoard';
import GameMessages from './GameMessages';
import TurnActions from './TurnActions';
import TurnOrder from './TurnOrder';
import YourCards from './YourCards';

import Styles from './GamePlay.module.css';

export default function GamePlay() {
	return (
		<>
			<div className={Styles.wrap}>
				<GameBoard />
				<div className={Styles.controls}>
					<TurnOrder />
					<YourCards />
					<DieRoll />
					<TurnActions />
				</div>
			</div>
			<GameMessages />
		</>
	);
}
