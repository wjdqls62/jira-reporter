import { useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

import { baseUrl, requestApi } from '@/lib/apiClient';
import { SWR_KEYS } from '@/lib/api/swrKeys';

interface AuthFormData {
	email: string;
	accessToken: string;
	issueKey: string;
	issueType: 'epic' | 'issues';
	checkListKey: string | null;
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

	const validateEpicPreflight = async (epicKey: string): Promise<void> => {
		// requestApi는 4xx/5xx 시 axios가 throw → error.response.data.error에서 메시지 추출
		const data = await requestApi<{ issues: any[] }>(
			'GET',
			SWR_KEYS.inquiryEpicIssue(epicKey),
		);

		if (!data || !Array.isArray((data as any).issues) || (data as any).issues.length === 0) {
			throw new Error('조회된 이슈가 없습니다. 이슈 키를 확인하거나 다른 키를 입력해주세요.');
		}
	};

	const validateIssuesPreflight = async (issueKeys: string[]): Promise<void> => {
		const data = await requestApi<{ issues: any[] }>(
			'POST',
			SWR_KEYS.inquiryMultipleIssue(),
			{ issueKeys },
		);

		const issues: any[] = (data as any)?.issues ?? [];

		if (issues.length === 0) {
			throw new Error('조회된 이슈가 없습니다. 이슈 키를 확인하거나 다른 키를 입력해주세요.');
		}

		// 결함 타입 검증
		for (const issue of issues) {
			const issueTypeName: string = issue.fields?.issuetype?.name ?? '';
			if (issueTypeName !== '결함') {
				throw new Error(
					`결함 유형이 아닌 이슈 키가 포함되어 있습니다. (${issue.key}: ${issueTypeName})`,
				);
			}
		}

		// 누락 키 검증
		const returnedKeys = new Set(issues.map((issue: any) => issue.key));
		const missingKeys = issueKeys.filter((key) => !returnedKeys.has(key));
		if (missingKeys.length > 0) {
			throw new Error(
				`존재하지 않는 이슈 키가 포함되어 있습니다. (${missingKeys.join(', ')})`,
			);
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

			// localStorage에 저장 (프리플라이트에서 apiClient 인터셉터가 헤더 주입에 사용)
			localStorage.setItem('email', formData.email);
			localStorage.setItem('jiraToken', formData.accessToken);
			localStorage.setItem('issueKey', formData.issueKey);
			localStorage.setItem('issueType', formData.issueType);
			localStorage.setItem('checkListKey', formData?.checkListKey || '');

			// 프리플라이트: 이슈 존재 여부 및 유효성 검증
			if (formData.issueType === 'epic') {
				await validateEpicPreflight(formData.issueKey);
			} else {
				const issueKeyArray = formData.issueKey
					.split(',')
					.map((key) => key.trim())
					.filter(Boolean);
				await validateIssuesPreflight(issueKeyArray);
			}

			// 데이터 파싱
			const checkListKeys = parseCheckListKeys(formData?.checkListKey || '');
			const issueKeys = parseIssueKeys(formData.issueKey, formData.issueType);

			// 성공 콜백 호출
			onSuccess(
				formData.accessToken,
				issueKeys,
				formData.issueType,
				checkListKeys,
			);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		submitWithAuth,
		isLoading,
	};
};
