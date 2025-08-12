import { Outlet } from 'react-router-dom';

import styles from './Layout.module.scss';

export default function Layout() {
	return (
		<div className={styles.layoutContainer}>
			<div className={styles.mainContent}>
				<Outlet />
			</div>
		</div>
	);
}
