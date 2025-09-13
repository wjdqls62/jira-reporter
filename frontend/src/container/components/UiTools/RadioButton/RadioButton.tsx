import { useEffect, useState } from 'react';

import styles from './RadioButton.module.scss';

export interface LabelWithValue {
	label: string;
	value: string;
}

interface RadioButtonProps {
	labelWithValue: LabelWithValue[];
	direction?: 'row' | 'column';
	defaultValue: string;
	onChange: (value: string) => void;
}

export default function RadioButton({
	labelWithValue,
	direction = 'column',
	defaultValue,
	onChange,
}: RadioButtonProps) {
	const [selected, setSelected] = useState(defaultValue);

	const onLabelClick = (value: string) => {
		setSelected(value);
	};

	useEffect(() => {
		onChange?.(selected);
	}, [selected]);

	return (
		<div className={styles.radioButton} style={{ flexDirection: direction }}>
			{labelWithValue.map((item, idx) => {
				return (
					<div
						className={styles.container}
						key={`radio-${item.label}-${idx}`}
						onClick={() => onLabelClick(item.value)}>
						<div className={item.value === selected ? styles.selected : ''}>
							<div />
						</div>
						<span>{item.label}</span>
					</div>
				);
			})}
		</div>
	);
}
