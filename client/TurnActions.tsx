import React from 'react';

import {
	GameStateContext,
	PlayerIdContext,
	SendMessageContext,
	YourCardsContext,
} from '#client/Context';
import SelectEnum from '#client/SelectEnum';
import styles from '#client/TurnActions.module.css';
import * as CanDo from '#common/canDo';
import type { Card, Room, Suspect, Weapon } from '#common/cards';
import { allRooms, allSuspects, allWeapons } from '#common/cards';
import type { Solution } from '#common/gameState';
import { boardConfig } from '#common/layout';

export default function TurnActions() {
	const gameState = React.use(GameStateContext);
	const playerId = React.use(PlayerIdContext);

	if (gameState.phase === 'GAME_OVER') {
		return null;
	}

	const yourTurn = gameState.currentPlayer === playerId;
	const currentPlayerName = gameState.players.get(
		gameState.currentPlayer,
	)!.name;

	let turnIndicator;
	if (yourTurn) {
		turnIndicator = <div>Your turn!</div>;
	} else {
		turnIndicator = <div>{currentPlayerName}'s turn</div>;
	}

	let disproving = null;
	if (
		gameState.phase === 'SUGGESTION_RESOLUTION' &&
		gameState.currentPlayerDisprovingSuggestion &&
		gameState.currentPlayerDisprovingSuggestion !== playerId
	) {
		const suggestionDisprover = gameState.players.get(
			gameState.currentPlayerDisprovingSuggestion,
		)!.name;
		const suggestionMaker = yourTurn ? 'your' : `${currentPlayerName}'s`;
		disproving = (
			<div>
				Waiting on {suggestionDisprover} to disprove {suggestionMaker}{' '}
				suggestion
			</div>
		);
	}

	return (
		<div>
			{turnIndicator}
			{disproving}
			<ul className={styles.actions}>
				<RollDie />
				<MoveThroughPassage />
				<MakeSuggestion />
				<DisproveSuggestion />
				<EndTurn />
				<MakeAccusation />
			</ul>
		</div>
	);
}

function RollDie() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);

	const err = CanDo.rollDie(playerId, gameState);
	const canRoll = err === null;
	if (!canRoll) {
		return null;
	}

	const roll = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage({ type: 'roll_die' });
	};

	return (
		<li>
			<button onClick={roll}>Roll die</button>
		</li>
	);
}

function MoveThroughPassage() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);

	const currentRoom = gameState.players.get(playerId)!.room;
	if (!currentRoom) {
		return null;
	}

	const passage = boardConfig.rooms[currentRoom].passage;
	if (!passage) {
		return null;
	}

	const err = CanDo.moveThroughPassage(playerId, gameState, passage);
	const canMove = err === null;
	if (!canMove) {
		return null;
	}

	const move = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage({ type: 'move_through_passage', room: passage });
	};

	return (
		<li>
			<button onClick={move}>Move through secret passage to {passage}</button>
		</li>
	);
}

function MakeSuggestion() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);

	const [expanded, setExpanded] = React.useState(false);

	const [suspect, setSuspect] = React.useState<Suspect>(allSuspects[0]);
	const [weapon, setWeapon] = React.useState<Weapon>(allWeapons[0]);

	const err = CanDo.makeAnySuggestion(playerId, gameState);
	const canSuggest = err === null;
	if (!canSuggest) {
		if (expanded) {
			setExpanded(false);
		}

		return null;
	}

	if (!expanded) {
		const expand = (e: React.SyntheticEvent) => {
			e.preventDefault();
			setExpanded(true);
		};
		return (
			<li>
				<button onClick={expand}>Make suggestion</button>
			</li>
		);
	}

	const room = gameState.players.get(playerId)!.room;
	if (!room) {
		throw new RangeError('Expected CanDo to ensure in a room');
	}

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		const suggestion: Solution = [suspect, weapon, room];
		sendMessage({ type: 'make_suggestion', suggestion });
	};

	return (
		<li>
			<form onSubmit={submit}>
				<SelectEnum
					onChange={setSuspect}
					values={allSuspects}
					value={suspect}
				/>{' '}
				with the{' '}
				<SelectEnum onChange={setWeapon} values={allWeapons} value={weapon} />{' '}
				in the {room} <input type="submit" value="Suggest" />
			</form>
		</li>
	);
}

function DisproveSuggestion() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);
	const yourCards = React.use(YourCardsContext);

	const err = CanDo.disproveAnySuggestion(playerId, gameState);
	const canDisprove = err === null;
	if (!canDisprove) {
		return null;
	}

	const handler = (card: Card | null) => (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage({ type: 'disprove_suggestion', card });
	};

	let haveDisprovingCard = false;
	const disproveButtons = [];
	for (const card of gameState.suggestion!) {
		if (yourCards.includes(card)) {
			haveDisprovingCard = true;
			disproveButtons.push(
				<li key={card}>
					<button onClick={handler(card)}>Disprove with {card}</button>
				</li>,
			);
		}
	}

	if (!haveDisprovingCard) {
		disproveButtons.push(
			<li key="cannot">
				<button onClick={handler(null)}>I cannot disprove!</button>
			</li>,
		);
	}

	return <>{disproveButtons}</>;
}

function MakeAccusation() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);

	const [expanded, setExpanded] = React.useState(false);

	const [suspect, setSuspect] = React.useState<Suspect>(allSuspects[0]);
	const [weapon, setWeapon] = React.useState<Weapon>(allWeapons[0]);
	const [room, setRoom] = React.useState<Room>(allRooms[0]);

	const err = CanDo.makeAccusation(playerId, gameState);
	const canAccuse = err === null;
	if (!canAccuse) {
		if (expanded) {
			setExpanded(false);
		}

		return null;
	}

	if (!expanded) {
		const expand = (e: React.SyntheticEvent) => {
			e.preventDefault();
			setExpanded(true);
		};
		return (
			<li>
				<button onClick={expand}>Make accusation</button>
			</li>
		);
	}

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		const accusation: Solution = [suspect, weapon, room];
		sendMessage({ type: 'make_accusation', accusation });
	};

	return (
		<li>
			<form onSubmit={submit}>
				<SelectEnum
					onChange={setSuspect}
					values={allSuspects}
					value={suspect}
				/>{' '}
				with the{' '}
				<SelectEnum onChange={setWeapon} values={allWeapons} value={weapon} />{' '}
				in the <SelectEnum onChange={setRoom} values={allRooms} value={room} />{' '}
				<input type="submit" value="Accuse" />
			</form>
		</li>
	);
}

function EndTurn() {
	const gameState = React.use(GameStateContext);
	const sendMessage = React.use(SendMessageContext);
	const playerId = React.use(PlayerIdContext);

	const err = CanDo.endTurn(playerId, gameState);
	const canEnd = err === null;
	if (!canEnd) {
		return null;
	}

	const end = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage({ type: 'end_turn' });
	};

	return (
		<li>
			<button onClick={end}>End turn</button>
		</li>
	);
}
