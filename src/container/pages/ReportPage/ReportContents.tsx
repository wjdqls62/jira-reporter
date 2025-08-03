import { useEffect, useMemo, useState } from 'react';

import styles from './ReportPage.module.scss';
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
	const [data, setData] = useState<ISubIssue[]>([]);

	const memoizedReportDetails = useMemo(() => {
		return (
			<div>
				<div>
					<table border={1}>
						<thead>
							<th colSpan={2}>구분</th>
							{/*<th />*/}
							<th>내용</th>
							<th>비고</th>
						</thead>
						<tbody>
							<tr>
								<td colSpan={2}>테스트 버전</td>
								<td>v3.0</td>
								<td>전탐: 123 윈탐 123</td>
							</tr>
							<tr>
								<td colSpan={2}>테스트 기간</td>
								<td>2025.06.09 ~ 2025.07.11</td>
								<td>Working Day(25일)</td>
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
				<div>
					<table border={1}>
						<thead>
							<th>번호</th>
							<th>키</th>
							<th>설명</th>

							<th>심각도</th>
							<th>처리 상태</th>
						</thead>
						<tbody>
							{data.map((issue, index) => {
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
				</div>
			</div>
		);
	}, [data]);

	useEffect(() => {
		const fetchData = async () => {
			await epicTrigger().then((res) => setData(res));
		};

		fetchData();
	}, []);

	if (data) {
		return (
			<div className={styles.reportContentsLayout}>
				{memoizedReportDetails}
				<div>
					{/*{epicData?.map((issue) => {
						return (
							<div key={issue.id}>
								<div>{`key:${issue.key}`}</div>
								<div>{`summary:${issue.summary}`}</div>
								<div>{`status: ${issue.status}`}</div>
								<div>{`version: ${issue.versions[0].name}`}</div>
								<div>{`fixVersion: ${issue.fixVersions[0]?.name || ''}`}</div>
								<div>{`assignee:${issue.assignee}`}</div>
								<div>{`reporter:${issue.reporter}`}</div>
								<div>{`priority:${issue.priority}`}</div>
								<div>{`issueType:${issue.issueType}`}</div>
								<div>===================================</div>
							</div>
						);
					})}*/}
				</div>
			</div>
		);
	}
}
