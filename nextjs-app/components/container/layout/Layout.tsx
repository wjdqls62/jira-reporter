'use client';

import styles from './Layout.module.scss';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className={styles.layoutContainer}>
			<div className={styles.mainContent}>
				{children}
			</div>
		</div>
	);
}
