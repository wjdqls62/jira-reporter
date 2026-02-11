import React from 'react';
import { useRouteError } from 'react-router-dom';

import styles from '../ErrorPage/ErrorPage.module.scss';
import Button from '../UiTools/Button/Button.tsx';

/**
 * 라우트 에러를 표시하는 컴포넌트
 */
export default function ErrorPage() {
	const errorObj = useRouteError() as any;

	const handleGotoHome = () => {
		window.location.href = '/report';
	};

	// 안전한 에러 파싱 로직
	let error = {
		errorMessage: '알 수 없는 오류',
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
		// 기본값 유지
	}

	return (
		<div className={styles.errorContainer}>
			<div>
				{errorCodeMap[error.statusCode] || '알 수 없는 오류가 발생했습니다.'}
			</div>
			<div style={{ width: '200px' }}>
				<Button
					backgroundColor={'red'}
					label={'이전 페이지'}
					onClick={handleGotoHome}
				/>
			</div>
		</div>
	);
}

const errorCodeMap = {
	['500']: '서버 오류가 발생했습니다.',
	['400']: '요청 파라미터 값이 잘못되었습니다.',
};
