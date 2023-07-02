import React from 'react';
import { css } from '@emotion/css';

import * as CanDo from 'common/CanDo';
import {
	Card,
	ClientToServerMessage,
	PlayPhase,
	Room,
	Solution,
	Suspect,
	Weapon,
} from 'common/Consts';
import { BoardConfig } from 'common/BoardLayout';

import {
	GameStateContext,
	SendMessageContext,
	SessionIdContext,
	YourCardsContext,
} from './Context'
import SelectEnum from './SelectEnum';

export default function TurnActions() {
	const gameState = React.useContext(GameStateContext);
	const sessionId = React.useContext(SessionIdContext);

	if (gameState.phase === PlayPhase.GAME_OVER) {
		return null;
	}

	const yourTurn = gameState.currentPlayer === sessionId;
	const currentPlayerName = gameState.players.get(gameState.currentPlayer)!.name;

	let turnIndicator;
	if (yourTurn) {
		turnIndicator = <div>Your turn!</div>;
	} else {
		turnIndicator = <div>{currentPlayerName}'s turn</div>;
	}

	let disproving = null;
	if (gameState.phase === PlayPhase.SUGGESTION_RESOLUTION &&
			gameState.currentPlayerDisprovingSuggestion &&
			gameState.currentPlayerDisprovingSuggestion !== sessionId) {
		const suggestionDisprover =
			gameState.players.get(gameState.currentPlayerDisprovingSuggestion)!.name;
		const suggestionMaker = yourTurn ? 'your' : `${currentPlayerName}'s`;
		disproving =
			<div>
				Waiting on {suggestionDisprover}
				{' '}
				to disprove {suggestionMaker} suggestion
			</div>;
	}

	return (
		<div>
			{turnIndicator}
			{disproving}
			<ul className={css({li: {margin: '10px 0'}})}>
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
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const err = CanDo.rollDie(sessionId, gameState);
	const canRoll = err === null;
	if (!canRoll) {
		return null;
	}

	const roll = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.ROLL_DIE, null);
	};

	return (
		<li><button onClick={roll}>Roll die</button></li>
	);
}

function MoveThroughPassage() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const currentRoom = gameState.players.get(sessionId)!.room;
	if (!currentRoom) {
		return null;
	}

	const passage = BoardConfig.rooms[currentRoom].passage;
	if (!passage) {
		return null;
	}

	const err = CanDo.moveThroughPassage(sessionId, gameState, passage);
	const canMove = err === null;
	if (!canMove) {
		return null;
	}

	const move = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.MOVE_THROUGH_PASSAGE, passage);
	};

	return (
		<li>
			<button onClick={move}>
				Move through secret passage to {passage}
			</button>
		</li>
	);
}

function MakeSuggestion() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const [expanded, setExpanded] = React.useState(false);

	const [suspect, setSuspect] = React.useState(Suspect.BLOOD);
	const [weapon, setWeapon] = React.useState(Weapon.AK47);

	const err = CanDo.makeAnySuggestion(sessionId, gameState);
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
		return <li><button onClick={expand}>Make suggestion</button></li>;
	}

	const room = gameState.players.get(sessionId)!.room;
	if (!room) {
		throw new RangeError('Expected CanDo to ensure in a room');
	}

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		const suggestion: Solution = [suspect, weapon, room];
		sendMessage(ClientToServerMessage.MAKE_SUGGESTION, suggestion);
	}

	return (
		<li>
			<form onSubmit={submit}>
				<SelectEnum
					onChange={setSuspect}
					values={Object.values(Suspect)}
					value={suspect}
				/>
				{' '}
				with the
				{' '}
				<SelectEnum
					onChange={setWeapon}
					values={Object.values(Weapon)}
					value={weapon}
				/>
				{' '}
				in the {room}
				{' '}
				<input type="submit" value="Suggest" />
			</form>
		</li>
	);
}

function DisproveSuggestion() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);
	const yourCards = React.useContext(YourCardsContext);

	const err = CanDo.disproveAnySuggestion(sessionId, gameState);
	const canDisprove = err === null;
	if (!canDisprove) {
		return null;
	}

	const handler = (c: Card | null) => (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.DISPROVE_SUGGESTION, c);
	};

	let haveDisprovingCard = false;
	let disproveButtons = [];
	for (const card of gameState.suggestion) {
		if (yourCards.includes(card)) {
			haveDisprovingCard = true;
			disproveButtons.push(
				<li key={card}>
					<button onClick={handler(card)}>Disprove with {card}</button>
				</li>
			);
		}
	}

	if (!haveDisprovingCard) {
		disproveButtons.push(
			<li key="cannot">
				<button onClick={handler(null)}>I cannot dispove!</button>
			</li>
		);
	}

	return <>{disproveButtons}</>;
}

function MakeAccusation() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const [expanded, setExpanded] = React.useState(false);

	const [suspect, setSuspect] = React.useState(Suspect.BLOOD);
	const [weapon, setWeapon] = React.useState(Weapon.AK47);
	const [room, setRoom] = React.useState(Room.DINING_ROOM);

	const err = CanDo.makeAccusation(sessionId, gameState);
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
		return <li><button onClick={expand}>Make accusation</button></li>;
	}

	const submit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		const accusation: Solution = [suspect, weapon, room];
		sendMessage(ClientToServerMessage.MAKE_ACCUSATION, accusation);
	}

	return (
		<li>
			<form onSubmit={submit}>
				<SelectEnum
					onChange={setSuspect}
					values={Object.values(Suspect)}
					value={suspect}
				/>
				{' '}
				with the
				{' '}
				<SelectEnum
					onChange={setWeapon}
					values={Object.values(Weapon)}
					value={weapon}
				/>
				{' '}
				in the
				{' '}
				<SelectEnum
					onChange={setRoom}
					values={Object.values(Room)}
					value={room}
				/>
				{' '}
				<input type="submit" value="Accuse" />
			</form>
		</li>
	);
}

function EndTurn() {
	const gameState = React.useContext(GameStateContext);
	const sendMessage = React.useContext(SendMessageContext);
	const sessionId = React.useContext(SessionIdContext);

	const err = CanDo.endTurn(sessionId, gameState);
	const canEnd = err === null;
	if (!canEnd) {
		return null;
	}

	const end = (e: React.SyntheticEvent) => {
		e.preventDefault();
		sendMessage(ClientToServerMessage.END_TURN, null);
	};

	return (
		<li><button onClick={end}>End turn</button></li>
	);
}
