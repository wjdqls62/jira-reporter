'use client';

import React from 'react';

import styles from './Header.module.scss';

interface HeaderProps {
	children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
	return (
		<div className={styles.headerContainer}>
			<div className={styles.title}>
				대시보드
				<span className={styles.version}>{process.env.NEXT_PUBLIC_BUILD_VERSION || 'v-'}</span>
			</div>
			<div className={styles.rightContent}>{children}</div>
		</div>
	);
}
