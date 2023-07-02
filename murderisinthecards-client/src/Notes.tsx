import React from 'react';
import { css } from '@emotion/css';

import {
	Card,
	Room,
	Suspect,
	Weapon,
} from 'murderisinthecards-common/Consts';

import { RoomIdContext } from './Context';
import getSuspectColor from './SuspectColor';

const LOCALSTORAGE_PREFIX = 'notes';
const COLS = 7;

export default function Notes() {
	return (
		<table>
			<tbody>
				<tr><th /><NoteInputRow prefix="header" /></tr>
				<SuspectSection cards={Object.values(Suspect)} />
				<tr><td><hr /></td></tr>
				<NoteSection cards={Object.values(Weapon)} />
				<tr><td><hr /></td></tr>
				<NoteSection cards={Object.values(Room)} />
			</tbody>
		</table>
	);
}

function NoteSection({ cards }: { cards: Card[] }) {
	const rows = [];
	for (const card of cards) {
		rows.push(
			<tr key={card}>
				<th>{card}</th>
				<NoteInputRow prefix={card} />
			</tr>
		);
	}

	return <>{rows}</>;
}

function SuspectSection({ cards }: { cards: Suspect[] }) {
	// This is largely copy-pasted from NoteSection -- refactor?
	// Also, the border styling is copied from TurnOrder -- refactor?
	const rows = [];
	for (const card of cards) {
		const style = {
			borderColor: getSuspectColor(card),
		};
		rows.push(
			<tr key={card}>
				<th className={css({'border': '2px solid'})} style={style}>{card}</th>
				<NoteInputRow prefix={card} />
			</tr>
		);
	}

	return <>{rows}</>;
}

function NoteInputRow({ prefix }: { prefix: string }) {
	const row = [];
	for (let i = 0; i < COLS; i++) {
		const suffix = `${prefix}.${i}`;
		row.push(<td key={suffix}><NoteInput suffix={suffix} /></td>);
	}

	return <>{row}</>;
}

function useRoomLocalStorageState(suffix: string) {
	const roomId = React.useContext(RoomIdContext);
	const key = `${LOCALSTORAGE_PREFIX}.${suffix}`;

	const [value, setValue] = React.useState(() => {
		try {
			const saved = localStorage.getItem(key);
			const o = JSON.parse(saved!);
			if (o.roomId === roomId) {
				return o.value;
			}
		} catch (_e) {
			// Ignore JSON parse failures, object read failures, etc. Just return the
			// default below.
		}

		return '';
	});

	React.useEffect(() => {
		const o = {roomId, value};
		localStorage.setItem(key, JSON.stringify(o));
	}, [key, roomId, value]);

	return [value, setValue];
}

function NoteInput({ suffix }: { suffix: string }) {
	const [value, setValue] = useRoomLocalStorageState(suffix);

	const handler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.currentTarget.value);
	};

	return <input type="text" size={3} value={value} onChange={handler} />;
}
