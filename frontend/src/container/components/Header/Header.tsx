import React from 'react';

import styles from './Header.module.scss';

interface HeaderProps {
	children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
	return (
		<div className={styles.headerContainer}>
			<div className={styles.title}>대시보드</div>
			<div className={styles.rightContent}>{children}</div>
		</div>
	);
}
