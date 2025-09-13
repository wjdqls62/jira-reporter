import type { InputHTMLAttributes } from 'react';

import styles from './TextField.module.scss';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export default function TextField({ label, ...props }: TextFieldProps) {
	return (
		<div className={styles.textField}>
			{label ? (
				<label>
					<span className={styles.labelText}>{label}</span>
					<input {...props} />
				</label>
			) : (
				<input {...props} />
			)}
		</div>
	);
}
