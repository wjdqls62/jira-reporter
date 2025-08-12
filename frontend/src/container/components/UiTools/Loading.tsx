import styles from './UiTools.module.scss';

export default function Loading() {
	return (
		<div className={styles.loadingOverlay}>
			<div>
				<img src='/src/assets/loading.svg' alt='loading' />
			</div>
		</div>
	);
}
