import React from 'react';
import { useRouteError } from 'react-router-dom';

import styles from '../ErrorPage/ErrorPage.module.scss';
import Button from '../UiTools/Button/Button.tsx';

/**
 * ?¼ìš°???ëŸ¬ë¥??œì‹œ?˜ëŠ” ì»´í¬?ŒíŠ¸
 */
export default function ErrorPage() {
	const errorObj = useRouteError() as any;

	const handleGotoHome = () => {
		window.location.href = '/report';
	};

	// ?ˆì „???ëŸ¬ ?Œì‹± ë¡œì§
	let error = {
		errorMessage: '?????†ëŠ” ?¤ë¥˜',
		statusCode: '500',
	};

	try {
		if (errorObj?.response?.data?.error) {
			const parseError = errorObj.response.data.error.split(':');
			if (parseError.length >= 2) {
				error = {
					errorMessage: parseError[0].trim(),
					statusCode: parseError[1].trim(),
				};
			}
		} else if (errorObj?.message) {
			error.errorMessage = errorObj.message;
		}
	} catch (e) {
		console.error('Error parsing error object:', e);
		// ê¸°ë³¸ê°?? ì?
	}

	return (
		<div className={styles.errorContainer}>
			<div>
				{errorCodeMap[error.statusCode] || '?????†ëŠ” ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.'}
			</div>
			<div style={{ width: '200px' }}>
				<Button
					backgroundColor={'red'}
					label={'?´ì „ ?˜ì´ì§€'}
					onClick={handleGotoHome}
				/>
			</div>
		</div>
	);
}

const errorCodeMap = {
	['500']: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
	['400']: '?”ì²­ ?Œë¼ë¯¸í„° ê°’ì´ ?˜ëª»?˜ì—ˆ?µë‹ˆ??',
};

