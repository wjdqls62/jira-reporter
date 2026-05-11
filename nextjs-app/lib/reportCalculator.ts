import { defectPriority } from '@/lib/constants/Issue';
import type { ISubIssue } from '@/lib/api/models/Epic';

interface IData {
	defects: ISubIssue[];
	improvements: ISubIssue[];
	excludeDefects: ISubIssue[];
	checkList: ISubIssue[];
}

export interface ReportMetrics {
	version: Set<string>;
	issueCount: {
		defects: number;
		improvements: number;
		checkList: {
			defect: number;
			improvements: number;
			works: number;
		};
	};
	fixedIssueCount: {
		defects: number;
		improvements: number;
		checkList: {
			defect: number;
			improvements: number;
			works: number;
		};
	};
	priorityCount: Record<string, number>;
	hasReopenIssue: {
		defects: boolean;
		improvements: boolean;
		checkListDefects: boolean;
		checkListImprovements: boolean;
		checkListWorks: boolean;
	};
	hasCheckListIssue: boolean;
	defectActionRates: string;
	improvementsActionRates: string;
}

export function calculateReportMetrics(epicData: IData): ReportMetrics {
	// 영향받는 버전 계산
	const version = new Set(
		epicData.defects.flatMap((issue) =>
			issue.versions.map((ver) => ver.name),
		),
	);

	// 총 이슈 카운트
	const issueCount = {
		defects: epicData.defects.length,
		improvements: epicData.improvements.length,
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

	// 수정된 이슈 카운트
	const fixedIssueCount = {
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

	// 중요도 카운트
	const priorityCount = defectPriority.reduce(
		(acc, type) => {
			acc[type] = epicData.defects.filter(
				(issue) => issue.defectPriority === type,
			).length;
			return acc;
		},
		{} as Record<string, number>,
	);

	// 이슈 유형별 재발생 이슈 여부
	const hasReopenIssue = {
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

	// 확인이슈 존재 여부
	const hasCheckListIssue = epicData.checkList.some((issue) => issue);

	// 전체 결함 조치율
	const defectFixedRate =
		((fixedIssueCount.defects + fixedIssueCount.checkList.defect) /
			(issueCount.defects + issueCount.checkList.defect)) *
		100;
	const defectActionRates = `${fixedIssueCount.defects + fixedIssueCount.checkList.defect} / ${issueCount.defects + issueCount.checkList.defect} = ${isNaN(defectFixedRate) ? 0 : defectFixedRate.toFixed(2)}%`;

	// 전체 개선 조치율
	const improvementsFixedRate =
		((fixedIssueCount.improvements +
			fixedIssueCount.checkList.improvements +
			fixedIssueCount.checkList.works) /
			(issueCount.improvements +
				issueCount.checkList.improvements +
				issueCount.checkList.works)) *
		100;
	const improvementsActionRates = `${fixedIssueCount.improvements + fixedIssueCount.checkList.improvements + fixedIssueCount.checkList.works} / ${
		issueCount.improvements +
		issueCount.checkList.improvements +
		issueCount.checkList.works
	} = ${isNaN(improvementsFixedRate) ? 0 : improvementsFixedRate.toFixed(2)}%`;

	return {
		version,
		issueCount,
		fixedIssueCount,
		priorityCount,
		hasReopenIssue,
		hasCheckListIssue,
		defectActionRates,
		improvementsActionRates,
	};
}
