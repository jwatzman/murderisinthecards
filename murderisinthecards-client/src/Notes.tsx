import React from 'react';

import Styles from './Notes.module.css';

const LOCALSTORAGE_ID = 'notes';

export default function Notes() {
	const [notes, setNotes] = React.useState(
		localStorage.getItem(LOCALSTORAGE_ID) || ''
	);

	const changeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newNotes = e.currentTarget.value;
		setNotes(newNotes);
		localStorage.setItem(LOCALSTORAGE_ID, newNotes);
	};

	return (
		<div>
			Notes:
			<textarea
				className={Styles.notes}
				value={notes}
				onChange={changeNotes}
			/>
		</div>
	);
}
