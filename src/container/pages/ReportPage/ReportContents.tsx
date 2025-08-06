import { useEffect, useMemo, useState } from 'react';

import styles from './ReportPage.module.scss';
import { Flex, Section } from '../../components/UiTools/UiTools.tsx';
import useJiraIssue from '../../hooks/useJiraIssue.ts';

import type { ISubIssue } from '../../../api/models/Epic.ts';

interface Props {
	issueType: 'epic' | 'issues' | null;
	issueKey: string | string[] | null;
}

export default function ReportContents({ issueType, issueKey }: Props) {
	const { epicData, epicTrigger } = useJiraIssue({
		issueType,
		issueKey: issueKey,
	});
	const [data, setData] = useState<{
		defects: ISubIssue[];
		improvements: ISubIssue[];
		excludeDefects: ISubIssue[];
	}>({
		defects: [],
		improvements: [],
		excludeDefects: [],
	});

	const memoizedReportDetails = useMemo(() => {
		const versions = new Set(
			data.defects.flatMap((issue) => issue.versions.map((ver) => ver.name)),
		);

		return (
			<Flex flexDirection={'column'} gap={50}>
				<Section title={'1. 테스트 요약'}>
					<div>
						<table border={1}>
							<thead>
								<th colSpan={2}>구분</th>
								<th>내용</th>
								<th>비고</th>
							</thead>
							<tbody>
								<tr>
									<td colSpan={2}>테스트 버전</td>
									<td>{Array.from(versions).join(', ')}</td>
									<td />
								</tr>
								<tr>
									<td colSpan={2}>테스트 기간</td>
									<td />
									<td>Working Day(n일)</td>
								</tr>
								<tr>
									<td rowSpan={4}>QC 이슈</td>
									<td>신규 등록 이슈</td>
									<td>57건</td>
									<td>결함: 46건 개선, 새기능: 11건</td>
								</tr>
								<tr>
									<td>결함 조치율</td>
									<td>17/46=37%</td>
									<td>닫힘, 해결 결함/신규 결함</td>
								</tr>
								<tr>
									<td>개선,새기능 조치율</td>
									<td>1/11</td>
									<td>닫힘, 해결(개선,새기능)/ 신규(개선,새기능)</td>
								</tr>
								<tr>
									<td>결함 심각도별 분포(유효한 결함 분석)</td>
									<td>장애: 1건 중요함: 7건 보통: 37건 사소함: 1건</td>
									<td />
								</tr>
							</tbody>
						</table>
					</div>
				</Section>
				<Section title={'2. 주요 결함 내역'}>
					<table border={1}>
						<IssueTableHeader />
						<tbody>
							{data.defects
								.filter((issue) => issue.issueType === '결함')
								.map((issue, index) => {
									return (
										<tr key={index}>
											<td>{index + 1}</td>
											<td>{issue.key}</td>
											<td>{issue.summary}</td>
											<td>{issue.priority}</td>
											<td>{issue.status}</td>
											<td>
												{issue.causeOfDetect.map((issue) => issue).join(', ')}
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</Section>
				<Section title={'3. 주요 개선 내역'}>
					<table border={1}>
						<IssueTableHeader type={'improvements'} />
						<tbody>
							{data.improvements
								.filter((issue) => issue.issueType === '개선')
								.map((issue, index) => {
									return (
										<tr key={index}>
											<td>{index + 1}</td>
											<td>{issue.key}</td>
											<td>{issue.summary}</td>
											<td>{issue.priority}</td>
											<td>{issue.status}</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</Section>
			</Flex>
		);
	}, [data]);

	useEffect(() => {
		const fetchData = async () => {
			await epicTrigger().then((res) => {
				const improveIssues = res.filter((issue) => issue.issueType === '개선');
				const defectsIssues = res
					.filter((issue) => issue.issueType === '결함')
					.filter((issue) =>
						issue.causeOfDetect.every((item) => !excludeIssue.includes(item)),
					);
				const excludeIssues = res
					.filter((issue) => issue.issueType === '결함')
					.filter((issue) =>
						issue.causeOfDetect.some((item) => excludeIssue.includes(item)),
					);
				setData({
					improvements: improveIssues,
					defects: defectsIssues,
					excludeDefects: excludeIssues,
				});
			});
		};
		fetchData();
	}, []);

	if (data) {
		return (
			<div className={styles.reportContentsLayout}>{memoizedReportDetails}</div>
		);
	}
}

const excludeIssue = ['테스트 오류', '이슈아님'];

const IssueTableHeader = ({
	type = 'defect',
}: {
	type?: 'defect' | 'improvements';
}) => {
	return (
		<thead>
			<th>번호</th>
			<th>키</th>
			<th>설명</th>
			<th>심각도</th>
			<th>처리 상태</th>
			{type === 'defect' && <th>결함 원인</th>}
		</thead>
	);
};
