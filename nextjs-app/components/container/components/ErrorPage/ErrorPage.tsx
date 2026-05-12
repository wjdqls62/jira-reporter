import React from 'react';
import styles from '../ErrorPage/ErrorPage.module.scss';

/**
 * ?�우???�러�??�시?�는 컴포?�트
 */
/*export default function ErrorPage() {
	const errorObj = useRouteError() as any;

	const handleGotoHome = () => {
		window.location.href = '/report';
	};

	// ?�전???�러 ?�싱 로직
	let error = {
		errorMessage: '?????�는 ?�류',
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
		// 기본�??��?
	}

	return (
		<div className={styles.errorContainer}>
			<div>
				{errorCodeMap[error.statusCode] || '?????�는 ?�류가 발생?�습?�다.'}
			</div>
			<div style={{ width: '200px' }}>
				<Button
					backgroundColor={'red'}
					label={'?�전 ?�이지'}
					onClick={handleGotoHome}
				/>
			</div>
		</div>
	);
}

const errorCodeMap = {
	['500']: '?�버 ?�류가 발생?�습?�다.',
	['400']: '?�청 ?�라미터 값이 ?�못?�었?�니??',
};*/
