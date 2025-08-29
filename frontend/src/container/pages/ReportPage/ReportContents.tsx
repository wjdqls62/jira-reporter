import { type ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useLocation } from 'react-router-dom';

import styles from './ReportPage.module.scss';
import { useReportPage } from './ReportPage.tsx';
import { defectPriority } from '../../../constants/Issue.ts';
import CustomChart from '../../components/CustomChart/CustomChart.tsx';
import Loading from '../../components/UiTools/Loading.tsx';
import { Flex, Section } from '../../components/UiTools/UiTools.tsx';
import useJiraIssue from '../../hooks/useJiraIssue.ts';

import type { ISubIssue } from '../../../api/models/Epic.ts';

export default function ReportContents() {
	const { state } = useLocation();
	const { epicData, mutate, isValidating, isLoading } = useJiraIssue({
		issueKey: state.issueKey as string | string[],
		issueType: state.issueType as 'epic' | 'issues',
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
	const { resetIssue } = useReportPage();

	const [chartTypes, setChartTypes] = useState<{
		defectReasonChart: 'bar' | 'pie' | 'radar';
	}>({
		defectReasonChart: 'bar',
	});

	const handleDeleteIssue = (issue: ISubIssue) => {
		setData((prev) => {
			const issueType = issue.issueType === '결함' ? 'defects' : 'improvements';
			return {
				...prev,
				[issueType]: prev[issueType].filter(
					(prevIssue) => prevIssue.id !== issue.id,
				),
			};
		});
	};

	const handleRefresh = async () => {
		await mutate().then(() => {
			initialDate(epicData);
		});
	};

	const handleGoHome = async () => {
		resetIssue();
		document.location.href = '/report';
	};

	const handleChangeCauseOfDetectType = (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		setChartTypes((prev) => {
			return {
				...prev,
				defectReasonChart: e.target.value as 'bar' | 'pie' | 'radar',
			};
		});
	};

	const memoizedReportDetails = useMemo(() => {
		const versions = new Set(
			data.defects.flatMap((issue) => issue.versions.map((ver) => ver.name)),
		);

		const fixedIssueCount = {
			defects: data.defects.filter(
				(issue) => issue.status === '닫힘' || issue.status === '해결함',
			).length,
			improvements: data.improvements.filter(
				(issue) => issue.status === '닫힘' || issue.status === '해결함',
			).length,
		};

		const priorityCount = defectPriority.reduce(
			(acc, type) => {
				acc[type] = data.defects.filter(
					(issue) => issue.defectPriority === type,
				).length;
				return acc;
			},
			{} as Record<string, number>,
		);

		const renderDefectReasonChart = () => {
			if (chartTypes.defectReasonChart === 'bar') {
				return (
					<CustomChart
						data={data.defects}
						dataKey={'causeOfDetect'}
						type={'defectReasonChart'}
					/>
				);
			} else if (chartTypes.defectReasonChart === 'pie') {
				return (
					<CustomChart
						data={data.defects}
						dataKey={'causeOfDetect'}
						type={'defectReasonPieChart'}
					/>
				);
			} else if (chartTypes.defectReasonChart === 'radar') {
				return (
					<CustomChart
						data={data.defects}
						dataKey={'causeOfDetect'}
						type={'defectReasonRadarChart'}
					/>
				);
			}
		};

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
									<td>{`${data.defects.length + data.improvements.length}건`}</td>
									<td>
										<div>{`결함: ${data.defects.length}건`}</div>
										<div>{`개선, 새기능: ${data.improvements.length}건`}</div>
									</td>
								</tr>
								{(() => {
									const hasReopenIssue = data.defects.some(
										(issue) => issue.reopenVersions.length >= 1,
									);
									return (
										<>
											<tr>
												<td rowSpan={hasReopenIssue ? 2 : 1}>결함 조치율</td>
												<td rowSpan={hasReopenIssue ? 2 : 1}>
													{`${fixedIssueCount.defects} / ${data.defects.length} = ${
														isNaN(
															(fixedIssueCount.defects / data.defects.length) *
																100,
														)
															? 0
															: (
																	(fixedIssueCount.defects /
																		data.defects.length) *
																	100
																).toFixed(2)
													}%`}
												</td>
												<td>닫힘, 해결 결함/신규 결함</td>
											</tr>
											{hasReopenIssue && (
												<tr>
													<td>
														{(() => {
															const reopenCount = data.defects.filter(
																(issue) => issue.reopenVersions.length >= 1,
															).length;
															const reopenIssueKeys = new Set(
																data.defects
																	.filter(
																		(issue) => issue.reopenVersions.length >= 1,
																	)
																	.flatMap((issue) => issue.key),
															);
															console.log(`reopenIssueKeys`, reopenIssueKeys);
															return (
																<>
																	<div>{`재발생: ${reopenCount}건`}</div>
																	<div>
																		{`(${Array.from(reopenIssueKeys)
																			.map((issue) => issue)
																			.join(', ')})`}
																	</div>
																</>
															);
														})()}
													</td>
												</tr>
											)}
										</>
									);
								})()}
								<tr>
									<td>개선,새기능 조치율</td>
									<td>{`${fixedIssueCount.improvements} / ${data.improvements.length} = ${
										isNaN(
											Number(
												(
													(fixedIssueCount.improvements /
														data.improvements.length) *
													100
												).toFixed(2),
											),
										)
											? 0
											: (fixedIssueCount.improvements /
													data.improvements.length) *
												100
									}%`}</td>
									<td>닫힘, 해결(개선,새기능)/ 신규(개선,새기능)</td>
								</tr>
								<tr>
									<td>결함 심각도별 분포(유효한 결함 분석)</td>
									<td>
										<div>
											{defectPriority.map((type, index) => (
												<div
													key={`priority-${index}`}>{`${type}: ${priorityCount[type]}건`}</div>
											))}
										</div>
									</td>
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
											<td align={'center'}>{index + 1}</td>
											<td className={styles.issueTitle}>{issue.summary}</td>
											<td className={styles.issueKey} align={'center'}>
												{issue.key}
											</td>
											<td align={'center'}>{issue.defectPriority}</td>
											<td align={'center'}>{issue.status}</td>
											<td className={styles.causeOfDetect}>
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
				<Section title={'2-1. 집계 제외 이슈 (이슈 아님)'}>
					<table border={1}>
						<IssueTableHeader type={'excludeDefects'} />
						<tbody>
							{data.excludeDefects.map((issue, index) => {
								return (
									<tr key={`$exclude-${index}`}>
										<td align={'center'}>{index + 1}</td>
										<td>{issue.summary}</td>
										<td className={styles.issueKey} align={'center'}>
											{issue.key}
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
											<td align={'center'}>{issue.key}</td>
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
				<Section title={'4. 차트'}>
					<Flex flexDirection={'column'}>
						<Section
							title={
								<Flex>
									<Flex>
										<span>4-1. 결함 원인별 발생 현황</span>
										<select onChange={handleChangeCauseOfDetectType}>
											<option value={'bar'}>막대 그래프</option>
											<option value={'pie'}>원형 그래프</option>
											<option value={'radar'}>레이더 차트</option>
										</select>
									</Flex>
								</Flex>
							}>
							<Flex flexDirection={'column'}>{renderDefectReasonChart()}</Flex>
						</Section>
						<Section title={'4-2. 이슈 중요도별 수정률'}>
							<CustomChart
								data={[...data.defects, ...data.improvements]}
								dataKey={'causeOfDetect'}
								type={'fixedChart'}
							/>
						</Section>
					</Flex>
				</Section>
			</Flex>
		);
	}, [data, chartTypes]);

	const initialDate = (epicData) => {
		if (epicData) {
			setData({
				defects: epicData.defects,
				improvements: epicData.improvements,
				excludeDefects: epicData.excludeDefects,
			});
		}
	};

	useEffect(() => {
		initialDate(epicData);
	}, [epicData]);

	if (isValidating) {
		return <Loading />;
	}

	return (
		<>
			<div className={styles.reportContentsLayout}>{memoizedReportDetails}</div>
			<div className={styles.footer}>
				<div className={styles.refresh}>
					<RefreshRoundedIcon {...iconProps} onClick={() => handleRefresh()} />
				</div>
				<div className={styles.home}>
					<HomeRoundedIcon {...iconProps} onClick={() => handleGoHome()} />
				</div>
			</div>
		</>
	);
}

const iconProps = {
	sx: { fontSize: 40 },
	cursor: 'pointer',
	color: 'primary',
};

const IssueTableHeader = ({
	type = 'defect',
}: {
	type?: 'defect' | 'improvements' | 'excludeDefects';
}) => {
	return (
		<thead>
			<th>번호</th>
			<th>설명</th>
			<th>키</th>
			<th>심각도</th>
			<th>처리 상태</th>
			{type !== 'improvements' && <th>결함 원인</th>}
			{type !== 'excludeDefects' && <th>삭제</th>}
		</thead>
	);
};
