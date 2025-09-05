import useSWR from 'swr';

import { requestApi } from '../../api/apiClient.ts';
import { SWR_KEYS } from '../../api/swrKeys.ts';
import { defectPriority } from '../../constants/Issue.ts';

import type { ISubIssue } from '../../api/models/Epic.ts';

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
	const {
		data: epicData,
		isLoading,
		isValidating,
		mutate,
	} = useSWR<any, Error>(
		issueType === 'epic'
			? SWR_KEYS.inquiryEpicIssue(issueKey as string)
			: SWR_KEYS.inquiryMultipleIssue(),
		async (url: string) => {
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

			const improveIssues = subIssues.filter(
				(issue: ISubIssue) =>
					issue.issueType === '개선' || issue.issueType === '새 기능',
			);
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
			console.log(`excludeIssue`, excludeIssues);

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
			return {
				improvements: improveIssues,
				defects: sortedDefectsIssues,
				excludeDefects: excludeIssues,
				checkList: checkListIssues,
			};
		},
		{
			suspense: true,
			revalidateOnMount: true, // 마운트 시 무조건 새 요청
			dedupingInterval: 0, // 중복 요청 방지 시간 0
			revalidateIfStale: true, // 캐시가 stale이면 즉시 요청
			revalidateOnFocus: false, // 포커스 이동 시 재요청 X (원하면 true)
		},
	);

	return { epicData, isLoading, mutate, isValidating };
}
