import { useState, useCallback, useEffect } from 'react';
import { requestApi } from '@/lib/apiClient';
import { SWR_KEYS } from '@/lib/api/swrKeys';
import { defectPriority, improvePriority } from '@/lib/constants/Issue';
import type { ISubIssue } from '@/lib/api/models/Epic';
import { enqueueSnackbar } from 'notistack';

interface Props {
	issueType: 'epic' | 'issues';
	issueKey: string | string[];
	checkListKey: string | null;
}

export default function useJiraIssue({
	issueType,
	issueKey,
	checkListKey,
}: Props) {
	const [epicData, setEpicData] = useState<any>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const mutate = useCallback(async (signal?: { cancelled: boolean }) => {
		setIsLoading(true);
		setError(null);
		try {
			let checkListRes;
			if (checkListKey !== null && checkListKey !== '') {
				checkListRes = await requestApi(
					'POST',
					SWR_KEYS.inquiryMultipleIssue(),
					{
						issueKeys: checkListKey,
					},
					{},
				);
			}
			const checkListIssues =
				checkListRes?.issues?.map((issue) => {
					return {
						id: issue.id,
						key: issue.key,
						parent: issue.fields.parent
							? {
									key: issue.fields.parent.key,
									summary: issue.fields.parent.fields.summary,
									status: issue.fields.parent.fields.status.name,
								}
							: null,
						summary: issue.fields.summary,
						versions: issue.fields.versions,
						fixVersions: issue.fields.fixVersions,
						assignee: issue.fields.assignee?.displayName || '',
						status: issue.fields.status.name,
						components: issue.fields.components,
						reporter: issue.fields.reporter.displayName,
						defectPriority: issue.fields.customfield_10044?.value || '',
						priority: issue.fields.priority.name,
						issueType: issue.fields.issuetype.name,
						resolutions: issue.fields?.resolutions || '',
						// 결함 원인
						causeOfDetect:
							issue.fields?.customfield_10042?.map((item) => item?.value) || [],
						// 재발생
						reopenVersions:
							issue.fields?.customfield_10104?.map((version) => version.name) ||
							[],
					} as ISubIssue;
				}) || [];

			const requestedCount = checkListKey
					?.split(',')
					.map((k) => k.trim())
					.filter((k) => k.length > 0).length ?? 0;
			if (checkListKey && requestedCount !== checkListIssues?.length) {
				enqueueSnackbar('확인 이슈 요청 갯수와 서버의 응답 갯수가 틀립니다.', {
					variant: 'warning',
					autoHideDuration: 1500,
					preventDuplicate: true,
					anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
				});
			}

			const url =
				issueType === 'epic'
					? SWR_KEYS.inquiryEpicIssue(issueKey as string)
					: SWR_KEYS.inquiryMultipleIssue();

			const res =
				issueType === 'epic'
					? await requestApi('GET', url, {}, {})
					: await requestApi(
							'post',
							url,
							{
								issueKeys: issueKey as string[],
							},
							{},
						);
			const excludeIssue = ['테스트 오류', '이슈아님', '재현되지 않음'];

			const subIssues = res.issues.map((issue) => {
				return {
					id: issue.id,
					key: issue.key,
					parent: issue.fields.parent
						? {
								key: issue.fields.parent.key,
								summary: issue.fields.parent.fields.summary,
								status: issue.fields.parent.fields.status.name,
							}
						: null,
					summary: issue.fields.summary,
					versions: issue.fields.versions,
					fixVersions: issue.fields.fixVersions,
					assignee: issue.fields.assignee?.displayName || '',
					status: issue.fields.status.name,
					components: issue.fields.components,
					reporter: issue.fields.reporter.displayName,
					defectPriority: issue.fields.customfield_10044?.value || '',
					priority: issue.fields.priority.name,
					issueType: issue.fields.issuetype.name,
					resolutions: issue.fields?.resolutions || '',
					// 결함 원인
					causeOfDetect:
						issue.fields?.customfield_10042?.map((item) =>
							item?.value?.trim(),
						) || [],
					// 재발생
					reopenVersions:
						issue.fields?.customfield_10104?.map((version) => version.name) ||
						[],
				} as ISubIssue;
			});

			const improveIssues: ISubIssue[] = subIssues.filter(
				(issue: ISubIssue) =>
					issue.issueType === '개선' || issue.issueType === '새 기능',
			);
			const sortedImproveIssues = improvePriority.flatMap((issue) => {
				const filteredIssue = improveIssues.filter(
					(ds) => ds.priority === issue,
				);
				const completedIssues = filteredIssue.filter(
					(ds) => ds.status === '해결함' || ds.status === '닫힘',
				);
				const inProgressIssues = filteredIssue.filter(
					(ds) =>
						ds.status === '진행' ||
						ds.status === '' ||
						ds.status === '열림' ||
						ds.status === '보류 중' ||
						ds.status === '피드백',
				);
				return [...inProgressIssues, ...completedIssues];
			});

			const defectsIssues = subIssues
				.filter((issue: ISubIssue) => issue.issueType === '결함')
				.filter((issue: ISubIssue) =>
					issue.causeOfDetect.every((item) => !excludeIssue.includes(item)),
				);

			const excludeIssues = subIssues
				.filter((issue: ISubIssue) => issue.issueType === '결함')
				.filter((issue: ISubIssue) =>
					issue.causeOfDetect.some((item) => excludeIssue.includes(item)),
				);

			// 정렬
			//TODO 정렬 코드 개선 필요
			const sortedDefectsIssues = defectPriority.flatMap((issue) => {
				const filteredIssue = defectsIssues.filter(
					(ds) => ds.defectPriority === issue,
				);
				const completedIssues = filteredIssue.filter(
					(ds) => ds.status === '해결함' || ds.status === '닫힘',
				);
				const inProgressIssues = filteredIssue.filter(
					(ds) =>
						ds.status === '진행' ||
						ds.status === '' ||
						ds.status === '열림' ||
						ds.status === '보류 중' ||
						ds.status === '피드백',
				);

				return [...inProgressIssues, ...completedIssues];
			});

			const result = {
				improvements: sortedImproveIssues,
				defects: sortedDefectsIssues,
				excludeDefects: excludeIssues,
				checkList: checkListIssues,
			};

			if (signal?.cancelled) return undefined;
			setEpicData(result);
			return result;
		} catch (err) {
			if (!signal?.cancelled) setError(err as Error);
			return undefined;
		} finally {
			if (!signal?.cancelled) setIsLoading(false);
		}
	}, [issueType, issueKey, checkListKey]);

	useEffect(() => {
		const signal = { cancelled: false };
		mutate(signal);
		return () => {
			signal.cancelled = true;
		};
	}, [mutate]);

	return { epicData, isLoading, mutate, error };
}
