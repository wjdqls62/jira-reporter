import { defectPriority } from '../../constants/Issue.ts';
import { useMemo } from 'react';
import type { ISubIssue } from '../../api/models/Epic.ts';

interface IData {
	defects: ISubIssue[];
	improvements: ISubIssue[];
	excludeDefects: ISubIssue[];
	checkList: ISubIssue[];
}

export default function useReportCalculator(epicData: IData) {
	// 영향받는 버전 계산
	const version = useMemo(() => {
		return new Set(
			epicData.defects.flatMap((issue) =>
				issue.versions.map((ver) => ver.name),
			),
		);
	}, [epicData]);

	// 총 이슈 카운트
	const issueCount = useMemo(() => {
		return {
			defects: epicData.defects.length,
			checkList: {
				defect: epicData.checkList.filter((issue) => issue.issueType === '결함')
					.length,
				improvements: epicData.checkList.filter(
					(issue) =>
						issue.issueType === '개선' || issue.issueType === '새 기능',
				).length,
				works: epicData.checkList.filter(
					(issue) => issue.issueType === '작업' || issue.issueType === '부작업',
				).length,
			},
		};
	}, [epicData.defects, epicData.checkList]);

	// 수정된 이슈 카운트
	const fixedIssueCount = useMemo(() => {
		return {
			defects: epicData.defects.filter(
				(issue) => issue.status === '닫힘' || issue.status === '해결함',
			).length,
			improvements: epicData.improvements.filter(
				(issue) => issue.status === '닫힘' || issue.status === '해결함',
			).length,
			checkList: {
				defect: epicData.checkList
					.filter((issue) => issue.issueType === '결함')
					.filter(
						(issue) => issue.status === '닫힘' || issue.status === '해결함',
					).length,
				improvements: epicData.checkList
					.filter(
						(issue) =>
							issue.issueType === '개선' || issue.issueType === '새 기능',
					)
					.filter(
						(issue) => issue.status === '닫힘' || issue.status === '해결함',
					).length,
				works: epicData.checkList
					.filter(
						(issue) =>
							issue.issueType === '작업' || issue.issueType === '부작업',
					)
					.filter(
						(issue) => issue.status === '닫힘' || issue.status === '해결함',
					).length,
			},
		};
	}, [epicData.defects, epicData.checkList, epicData.improvements]);

	// 중요도 카운트
	const priorityCount = useMemo(() => {
		return defectPriority.reduce(
			(acc, type) => {
				acc[type] = epicData.defects.filter(
					(issue) => issue.defectPriority === type,
				).length;
				return acc;
			},
			{} as Record<string, number>,
		);
	}, [epicData.defects]);

	// 이슈 유형별 재발생 이슈 여부
	const hasReopenIssue = useMemo(() => {
		return {
			defects: epicData.defects.some(
				(issue) => issue.reopenVersions.length >= 1,
			),
			improvements: epicData.improvements.some(
				(issue) => issue.reopenVersions.length >= 1,
			),
			checkListDefects: epicData.checkList
				.filter((issue) => issue.issueType === '결함')
				.some((issue) => issue.reopenVersions.length >= 1),
			checkListImprovements: epicData.checkList
				.filter((issue) => issue.issueType === '개선')
				.some((issue) => issue.reopenVersions.length >= 1),
			checkListWorks: epicData.checkList
				.filter(
					(issue) => issue.issueType === '작업' || issue.issueType === '부작업',
				)
				.some((issue) => issue.reopenVersions.length >= 1),
		};
	}, [epicData]);

	// 확인이슈 존재 여부
	const hasCheckListIssue = useMemo(() => {
		return epicData.checkList.some((issue) => issue);
	}, [epicData.checkList]);

	return {
		version,
		issueCount,
		fixedIssueCount,
		priorityCount,
		hasReopenIssue,
		hasCheckListIssue,
	};
}
