import type React from 'react';

import styles from './Button.module.scss';

interface ButtonProps {
	label: string;
	backgroundColor?: 'black' | 'gray' | 'white';
	icon?: React.ReactNode;
	onClick?: () => void;
}

export default function Button({ label, icon, onClick }: ButtonProps) {
	const onClickHandler = () => {
		onClick?.();
	};

	return (
		<div className={styles.buttonContainer} onClick={onClickHandler}>
			{icon && <span className={styles.icon}>{icon}</span>}
			<span>{label}</span>
		</div>
	);
}
