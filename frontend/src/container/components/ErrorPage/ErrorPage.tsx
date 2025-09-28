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

	const parseError = errorObj.response.data.error.split(':');
	const error = {
		errorMessage: parseError[0].trim(),
		statusCode: parseError[1].trim(),
	};

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
