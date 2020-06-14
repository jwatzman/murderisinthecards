import React from 'react';

type Props<T> = { onChange: (val: T) => void, values: T[], value: T };
export default function SelectEnum<T extends string>(
	{ onChange, values, value }: Props<T>
) {
	const changeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newVal = (e.currentTarget.value as unknown) as T;
		onChange(newVal);
	};

	return (
		<select value={value} onChange={changeHandler}>
			{values.map(v => <option value={v} key={v}>{v}</option>)}
		</select>
	);
}
