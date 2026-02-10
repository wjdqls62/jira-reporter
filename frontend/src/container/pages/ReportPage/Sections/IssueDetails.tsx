import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { FiInfo } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

import { JIRA_BASE_BROWSE_URL } from '@/constants/Common';
import { Flex, Section } from '@/container/components/UiTools/UiTools';
import {
	type DataProps,
	IssueTableHeader,
} from '@/container/pages/ReportPage/ReportContents.tsx';

import styles from '../ReportPage.module.scss';

import type { ISubIssue } from '@/api/models/Epic';

interface IssueDetailProp {
	type: 'defects' | 'improvements';
	data: {
		checkList: ISubIssue[];
		defects: ISubIssue[];
		improvements?: ISubIssue[];
	};
	handleDeleteIssue: (issue: ISubIssue) => void;
}

interface ExcludeDetailsProp {
	data: {
		excludeDefects: ISubIssue[];
	};
}

interface ImprovementDetailsProp {
	data: {
		improvements: ISubIssue[];
	};
	handleDeleteIssue: (issue: ISubIssue) => void;
}

interface ReopenDetailProps {
	type: 'defect_improvement' | 'checkList';
	data: DataProps;
}

export const DefectDetails = ({ data, handleDeleteIssue }: IssueDetailProp) => {
	return (
		<Section
			title={
				<>
					<span>2. 주요 결함 내역</span>
				</>
			}>
			<table border={1}>
				<IssueTableHeader />
				<tbody>
					{data.defects
						.filter((issue) => issue.issueType === '결함')
						.map((issue, index) => {
							return (
								<tr key={index}>
									<td align={'center'}>{index + 1}</td>
									<td className={styles.issueTitle}>{issue.summary}</td>
									<td className={styles.issueKey} align={'center'}>
										<NavLink
											to={`${JIRA_BASE_BROWSE_URL}${issue.key}`}
											target={'_blank'}>
											{issue.key}
										</NavLink>
									</td>
									<td align={'center'}>{issue.defectPriority}</td>
									<td align={'center'}>{issue.status}</td>
									<td align={'center'} className={styles.causeOfDetect}>
										{issue.causeOfDetect.map((issue) => issue).join(', ')}
									</td>
									<td align={'center'}>
										<span
											className={styles.clickable}
											onClick={() => handleDeleteIssue(issue)}>
											❌
										</span>
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</Section>
	);
};

export const IssueDetails = ({
	type,
	handleDeleteIssue,
	data,
}: IssueDetailProp) => {
	const titleMap = {
		['defects']: '2. 주요 결함 내역',
		['improvements']: '3. 주요 개선 내역',
	};

	const DefectReason = ({ issue }: { issue: ISubIssue; index: number }) => {
		return (
			type === 'defects' && (
				<td align={'center'} className={styles.causeOfDetect}>
					{issue.causeOfDetect.map((issue) => issue).join(', ')}
				</td>
			)
		);
	};

	return (
		<Section title={titleMap[type]}>
			<table border={1}>
				<IssueTableHeader type={type as 'defects' | 'improvements'} />
				<tbody>
					{(data[`${type}`] as ISubIssue[])
						.filter((issue) =>
							type === 'defects'
								? issue.issueType === '결함'
								: issue.issueType === '개선' || issue.issueType === '새 기능',
						)
						.map((issue, index) => {
							return (
								<tr key={`issue-detail-${issue.key}`}>
									<td align={'center'}>{index + 1}</td>
									<td>{issue.summary}</td>
									<td align={'center'}>
										<NavLink
											to={`${JIRA_BASE_BROWSE_URL}${issue.key}`}
											target={'_blank'}>
											{issue.key}
										</NavLink>
									</td>
									<td align={'center'}>{issue.priority}</td>
									<td align={'center'}>{issue.status}</td>
									<DefectReason issue={issue} index={index} />
									<td align={'center'}>
										<span
											className={styles.clickable}
											onClick={() => handleDeleteIssue(issue)}>
											❌
										</span>
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</Section>
	);
};

export const ImprovementDetails = ({
	data,
	handleDeleteIssue,
}: ImprovementDetailsProp) => {
	return (
		<Section title={'3. 주요 개선 내역'}>
			<table border={1}>
				<IssueTableHeader type={'improvements'} />
				<tbody>
					{data.improvements
						.filter(
							(issue) =>
								issue.issueType === '개선' || issue.issueType === '새 기능',
						)
						.map((issue, index) => {
							return (
								<tr key={index}>
									<td align={'center'}>{index + 1}</td>
									<td>{issue.summary}</td>
									<td align={'center'}>
										<NavLink
											to={`${JIRA_BASE_BROWSE_URL}${issue.key}`}
											target={'_blank'}>
											{issue.key}
										</NavLink>
									</td>
									<td align={'center'}>{issue.priority}</td>
									<td align={'center'}>{issue.status}</td>
									<td align={'center'}>
										<span
											className={styles.clickable}
											onClick={() => handleDeleteIssue(issue)}>
											❌
										</span>
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</Section>
	);
};

export const ExcludeDetails = ({ data }: ExcludeDetailsProp) => {
	return (
		<Section
			title={(() => {
				return (
					<Flex gap={6}>
						<span>6. 집계 제외 이슈 (이슈 아님)</span>
						<Tooltip
							title={
								'`이슈 아님`, `테스트 오류`, `재현되지 않음`  유형의 결함 이슈를 통계에서 제외합니다.'
							}>
							<div style={{ display: 'inline-flex', cursor: 'pointer' }}>
								<FiInfo size={18} />
							</div>
						</Tooltip>
					</Flex>
				);
			})()}>
			<table border={1}>
				<IssueTableHeader type={'excludeDefects'} />
				<tbody>
					{data.excludeDefects.map((issue, index) => {
						return (
							<tr key={`$exclude-${index}`}>
								<td align={'center'}>{index + 1}</td>
								<td>{issue.summary}</td>
								<td className={styles.issueKey} align={'center'}>
									<NavLink
										to={`${JIRA_BASE_BROWSE_URL}${issue.key}`}
										target={'_blank'}>
										{issue.key}
									</NavLink>
								</td>
								<td align={'center'}>{issue.priority}</td>
								<td align={'center'}>{issue.status}</td>
								<td align={'center'}>{issue.causeOfDetect.join(', ')}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</Section>
	);
};

export const ReopenDetails = ({
	type = 'defect_improvement',
	data,
}: ReopenDetailProps) => {
	const title =
		type === 'defect_improvement'
			? '4. 재발생 이슈 (QC 이슈)'
			: '5. 재발생 이슈 (확인 이슈)';
	// 재발생 이슈 집계
	const combinedReopenIssues: Set<ISubIssue> =
		type === 'defect_improvement'
			? new Set([
					...data.defects.filter((issue) => issue.reopenVersions.length >= 1),
					...data.improvements.filter(
						(issue) => issue.reopenVersions.length >= 1,
					),
				])
			: type === 'checkList'
				? new Set([
						...data.checkList.filter(
							(issue) => issue.reopenVersions.length >= 1,
						),
					])
				: new Set();

	return (
		<Section title={title}>
			<table border={1}>
				<IssueTableHeader type={'reopen'} />
				<tbody>
					{Array.from(combinedReopenIssues).length === 0 ? (
						<tr>
							<td colSpan={8} align={'center'}>
								{`데이터가 없습니다.`}
							</td>
						</tr>
					) : (
						Array.from(combinedReopenIssues).map((issue, index) => {
							return (
								<tr key={`reopenIssue-${type}-${index}`}>
									<td align={'center'}>{index + 1}</td>
									<td align={'center'}>{issue.issueType}</td>
									<td>{issue.summary}</td>
									<td align={'center'}>
										<NavLink
											to={`${JIRA_BASE_BROWSE_URL}${issue.key}`}
											target={'_blank'}>
											{issue.key}
										</NavLink>
									</td>
									<td align={'center'}>{issue.priority}</td>
									<td align={'center'}>{issue.status}</td>
									<td align={'center'}>{issue.causeOfDetect.join(', ')}</td>
									<td align={'center'}>
										{issue.reopenVersions.map((version) => version).join(', ')}
									</td>
								</tr>
							);
						})
					)}
				</tbody>
			</table>
		</Section>
	);
};
