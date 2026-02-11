import { useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

import { baseUrl } from '../../api/apiClient';
import { SWR_KEYS } from '../../api/swrKeys';

interface AuthFormData {
	email: string;
	accessToken: string;
	issueKey: string;
	issueType: 'epic' | 'issues';
	checkListKey: string;
}

interface UseAuthReturn {
	submitWithAuth: (
		formData: AuthFormData,
		onSuccess: (
			token: string,
			issueKey: string | string[],
			issueType: 'epic' | 'issues',
			checkListKey: string[] | null,
		) => void,
	) => Promise<void>;
	isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
	const [isLoading, setIsLoading] = useState(false);

	const parseCheckListKeys = (checkListKey: string): string[] | null => {
		if (!checkListKey || checkListKey.trim() === '') return null;

		return checkListKey
			.split(',')
			.map((key) => key.trim())
			.filter((key) => key !== '');
	};

	const parseIssueKeys = (
		issueKey: string,
		issueType: 'epic' | 'issues',
	): string | string[] => {
		if (issueType === 'epic') {
			return issueKey;
		} else {
			return issueKey.split(',').map((key) => key.trim());
		}
	};

	const validateToken = async (
		email: string,
		accessToken: string,
	): Promise<void> => {
		const response = await axios.post(
			`${baseUrl}${SWR_KEYS.validateToken}`,
			{},
			{
				headers: {
					username: email,
					password: accessToken,
				},
			},
		);

		const { data } = response;
		if (data.message !== '인증이 성공했습니다.') {
			throw new Error('인증에 실패했습니다.');
		}
	};

	const submitWithAuth = async (
		formData: AuthFormData,
		onSuccess: (
			token: string,
			issueKey: string | string[],
			issueType: 'epic' | 'issues',
			checkListKey: string[] | null,
		) => void,
	): Promise<void> => {
		setIsLoading(true);

		try {
			// 토큰 검증
			await validateToken(formData.email, formData.accessToken);

			// 성공 알림
			enqueueSnackbar('인증이 성공했습니다.', {
				variant: 'success',
				autoHideDuration: 1500,
				anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
			});

			// localStorage에 저장
			localStorage.setItem('email', formData.email);
			localStorage.setItem('jiraToken', formData.accessToken);
			localStorage.setItem('issueKey', formData.issueKey);
			localStorage.setItem('issueType', formData.issueType);
			localStorage.setItem('checkListKey', formData.checkListKey);

			// 데이터 파싱
			const checkListKeys = parseCheckListKeys(formData.checkListKey);
			const issueKeys = parseIssueKeys(formData.issueKey, formData.issueType);

			// 성공 콜백 호출
			onSuccess(
				formData.accessToken,
				issueKeys,
				formData.issueType,
				checkListKeys,
			);
		} catch (error: any) {
			// 에러 처리
			const errorMessage =
				error.response?.data || error.message || '인증 중 오류가 발생했습니다.';
			alert(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		submitWithAuth,
		isLoading,
	};
};
