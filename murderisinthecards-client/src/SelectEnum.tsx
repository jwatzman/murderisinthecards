import React from 'react';

type Props<T> = { onChange: (val: T) => void, values: T[] };
export default function SelectEnum<T extends string>(
	{ onChange, values }: Props<T>
) {
	const [val, changeVal] = React.useState(values[0]);

	const changeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newVal = (e.currentTarget.value as unknown) as T;
		changeVal(newVal);
		onChange(newVal);
	};

	return (
		<select value={val} onChange={changeHandler}>
			{values.map(v => <option value={v} key={v}>{v}</option>)}
		</select>
	);
}
