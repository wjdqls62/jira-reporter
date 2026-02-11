import type React from 'react';

import styles from './Button.module.scss';

interface ButtonProps {
	label: string;
	backgroundColor?: 'black' | 'gray' | 'white';
	icon?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}

export default function Button({
	label,
	icon,
	onClick,
	disabled,
}: ButtonProps) {
	const onClickHandler = () => {
		onClick?.();
	};

	return (
		<div
			className={`${styles.buttonContainer} ${disabled ? styles.disabled : ''}`}
			onClick={onClickHandler}>
			{icon && <span className={styles.icon}>{icon}</span>}
			<span>{label}</span>
		</div>
	);
}
