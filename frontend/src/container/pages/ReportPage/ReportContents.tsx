import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { FiInfo } from 'react-icons/fi';
import { HiOutlineRefresh } from 'react-icons/hi';
import { MdLogout } from 'react-icons/md';
import { NavLink, useLocation } from 'react-router-dom';

import styles from './ReportPage.module.scss';
import { useReportPage } from './ReportPage.tsx';
import { JIRA_BASE_BROWSE_URL } from '../../../constants/Common.ts';
import { defectPriority } from '../../../constants/Issue.ts';
import CustomChart from '../../components/CustomChart/CustomChart.tsx';
import Header from '../../components/Header/Header.tsx';
import Button from '../../components/UiTools/Button/Button.tsx';
import Divider from '../../components/UiTools/Divider.tsx';
import Loading from '../../components/UiTools/Loading.tsx';
import { Flex, Section } from '../../components/UiTools/UiTools.tsx';
import useJiraIssue from '../../hooks/useJiraIssue.ts';

import type { ISubIssue } from '../../../api/models/Epic.ts';

export default function ReportContents() {
	const { state } = useLocation();
	const { epicData, mutate, isValidating, isLoading } = useJiraIssue({
		issueKey: state.issueKey as string | string[],
		issueType: state.issueType as 'epic' | 'issues',
		checkListKey: state?.checkListKey || null,
	});

	const [data, setData] = useState<{
		defects: ISubIssue[];
		improvements: ISubIssue[];
		excludeDefects: ISubIssue[];
		checkList: ISubIssue[];
	}>({
		defects: [],
		improvements: [],
		excludeDefects: [],
		checkList: [],
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

		const issueCount = {
			defects: data.defects.length,
			improvements: data.improvements.length,
			checkList: {
				defect: data.checkList.filter((issue) => issue.issueType === '결함')
					.length,
				improvements: data.checkList.filter(
					(issue) =>
						issue.issueType === '개선' || issue.issueType === '새 기능',
				).length,
				works: data.checkList.filter(
					(issue) => issue.issueType === '작업' || issue.issueType === '부작업',
				).length,
			},
		};

		const fixedIssueCount = {
			defects: data.defects.filter(
				(issue) => issue.status === '닫힘' || issue.status === '해결함',
			).length,
			improvements: data.improvements.filter(
				(issue) => issue.status === '닫힘' || issue.status === '해결함',
			).length,
			checkList: {
				defect: data.checkList
					.filter((issue) => issue.issueType === '결함')
					.filter(
						(issue) => issue.status === '닫힘' || issue.status === '해결함',
					).length,
				improvements: data.checkList
					.filter(
						(issue) =>
							issue.issueType === '개선' || issue.issueType === '새 기능',
					)
					.filter(
						(issue) => issue.status === '닫힘' || issue.status === '해결함',
					).length,
				works: data.checkList
					.filter(
						(issue) =>
							issue.issueType === '작업' || issue.issueType === '부작업',
					)
					.filter(
						(issue) => issue.status === '닫힘' || issue.status === '해결함',
					).length,
			},
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

		// 재발생 여부
		const hasReopenIssue = {
			defects: data.defects.some((issue) => issue.reopenVersions.length >= 1),
			improvements: data.improvements.some(
				(issue) => issue.reopenVersions.length >= 1,
			),
			checkListDefects: data.checkList
				.filter((issue) => issue.issueType === '결함')
				.some((issue) => issue.reopenVersions.length >= 1),
			checkListImprovements: data.checkList
				.filter((issue) => issue.issueType === '개선')
				.some((issue) => issue.reopenVersions.length >= 1),
		};

		const hasCheckListIssue = data.checkList.some((issue) => issue);

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
								{hasCheckListIssue && (
									<>
										<tr>
											<td rowSpan={issueCount.checkList.works >= 1 ? 3 : 2}>
												확인 대상
											</td>
											<td>결함 조치율</td>
											<td>
												{(() => {
													const fixedRate =
														(fixedIssueCount.checkList.defect /
															issueCount.checkList.defect) *
														100;
													return `${fixedIssueCount.checkList.defect} / ${issueCount.checkList.defect} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
												})()}
											</td>
											<td>닫힘,해결 /전체</td>
										</tr>
										<tr>
											<td>개선,새 기능 조치율</td>
											<td>
												{(() => {
													const fixedRate =
														(fixedIssueCount.checkList.improvements /
															issueCount.checkList.improvements) *
														100;
													return `${fixedIssueCount.checkList.improvements} / ${issueCount.checkList.improvements} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
												})()}
											</td>
											<td>닫힘,해결 /전체(개선,새기능)</td>
										</tr>
										{(() => {
											if (issueCount.checkList.works >= 1) {
												const fixedRate =
													(fixedIssueCount.checkList.works /
														issueCount.checkList.works) *
													100;
												return (
													<tr>
														<td>작업, 부작업 조치율</td>
														<td>
															{`${fixedIssueCount.checkList.works} / ${issueCount.checkList.works} = ${isNaN(fixedRate) ? 0 : fixedRate}%`}
														</td>
														<td>닫힘,해결 /전체(작업, 부작업)</td>
													</tr>
												);
											}
										})()}
									</>
								)}
								<tr>
									<td rowSpan={6}>QC 이슈</td>
									<td>신규 등록 이슈</td>
									<td>{`${data.defects.length + data.improvements.length}건`}</td>
									<td>
										<div>{`결함: ${data.defects.length}건`}</div>
										<div>{`개선, 새기능: ${data.improvements.length}건`}</div>
									</td>
								</tr>
								{(() => {
									/*const hasReopenIssue = data.defects.some(
										(issue) => issue.reopenVersions.length >= 1,
									);*/
									return (
										<>
											<tr>
												<td rowSpan={2}>결함 조치율</td>
												<td rowSpan={2}>
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
											<tr>
												<td>
													{hasReopenIssue.defects ? (() => {
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
													})() : '-'}
												</td>
											</tr>
										</>
									);
								})()}
								<tr>
									<td rowSpan={2}>개선,새기능 조치율</td>
									<td rowSpan={2}>
										{`${fixedIssueCount.improvements} / ${data.improvements.length} = ${
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
											: Number(
													(fixedIssueCount.improvements /
														data.improvements.length) *
														100,
												).toFixed(2)
									}%`}
									</td>
									<td>닫힘, 해결(개선,새기능)/ 신규(개선,새기능)</td>
								</tr>
								<tr>
									<td>
										{hasReopenIssue.improvements ? (() => {
											const reopenCount = data.improvements.filter(
												(issue) => issue.reopenVersions.length >= 1,
											);
											const reopenImprovementsKeys = new Set(
												data.improvements
													.filter((issue) => issue.reopenVersions.length >= 1)
													.flatMap((issue) => issue.key),
											);
											return (
												<>
													<div>재발생: {`${reopenCount.length}개`}</div>
													<div>
														{`(${Array.from(reopenImprovementsKeys)
															.map((issue) => issue)
															.join(', ')})`}
													</div>
												</>
											);
										})() : '-'}
									</td>
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
								{hasCheckListIssue && (
									<tr>
										<td rowSpan={2}>전체 이슈</td>
										<td>결함 조치율</td>
										<td>
											{(() => {
												const fixedRate =
													((fixedIssueCount.defects +
														fixedIssueCount.checkList.defect) /
														(issueCount.defects +
															issueCount.checkList.defect)) *
													100;
												return `${fixedIssueCount.defects + fixedIssueCount.checkList.defect} / ${issueCount.defects + issueCount.checkList.defect} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
											})()}
										</td>
										<td>확인대상(결함,작업) + QC결함</td>
									</tr>
								)}
								{hasCheckListIssue && (
									<tr>
										<td>개선 조치율</td>
										<td>
											{(() => {
												const fixedRate =
													((fixedIssueCount.improvements +
														fixedIssueCount.checkList.improvements) /
														(issueCount.improvements +
															issueCount.checkList.improvements)) *
													100;
												return `${fixedIssueCount.improvements + fixedIssueCount.checkList.improvements} / ${
													issueCount.improvements +
													issueCount.checkList.improvements
												} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
											})()}
										</td>
										<td>확인대상 + 신규 개선,새기능</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</Section>
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
				<Section
					title={(() => {
						return (
							<Flex gap={6}>
								<span>2-1. 집계 제외 이슈 (이슈 아님)</span>
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
				{(hasReopenIssue.defects || hasReopenIssue.improvements) && (
					<Section title={'2-2. 재발생 이슈 (QC 이슈)'}>
						<table border={1}>
							<IssueTableHeader type={'reopen'} />
							<tbody>
								{(() => {
									const combinedReopenIssues = new Set([
										...data.defects.filter(
											(issue) => issue.reopenVersions.length >= 1,
										),
										...data.improvements.filter(
											(issue) => issue.reopenVersions.length >= 1,
										),
									]);

									return Array.from(combinedReopenIssues).map(
										(issue, index) => {
											return (
												<tr key={'reopenIssue'}>
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
													<td align={'center'}>
														{issue.causeOfDetect.join(', ')}
													</td>
													<td align={'center'}>
														{issue.reopenVersions
															.map((version) => version)
															.join(', ')}
													</td>
												</tr>
											);
										},
									);
								})()}
							</tbody>
						</table>
					</Section>
				)}
				{(hasReopenIssue.checkListDefects ||
					hasReopenIssue.checkListImprovements) && (
					<Section title={'2-3. 재발생 이슈 (확인 이슈)'}>
						<table border={1}>
							<IssueTableHeader type={'reopen'} />
							<tbody>
								{(() => {
									const combinedReopenCheckListIssues = new Set([
										...data.checkList.filter(
											(issue) => issue.reopenVersions.length >= 1,
										),
									]);

									return Array.from(combinedReopenCheckListIssues).map(
										(issue, index) => {
											return (
												<tr key={'reopenIssue'}>
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
													<td align={'center'}>
														{issue.causeOfDetect.join(', ')}
													</td>
													<td align={'center'}>
														{issue.reopenVersions
															.map((version) => version)
															.join(', ')}
													</td>
												</tr>
											);
										},
									);
								})()}
							</tbody>
						</table>
					</Section>
				)}
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
				checkList: epicData.checkList,
			});
		}
	};

	useEffect(() => {
		initialDate(epicData);

		if (state.checkListKey !== null && epicData.checkList.length === 0) {
			enqueueSnackbar('확인 이슈 검색 결과가 없습니다.', {
				variant: 'warning',
				autoHideDuration: 3000,
				preventDuplicate: true,
				anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
			});
		}
	}, [epicData]);

	if (isValidating) {
		return <Loading />;
	}

	return (
		<div className={styles.reportContainer}>
			<div>
				<Divider align={'horizontal'} color={'#a1a1a1'} />
				<Header>
					<>
						<Button
							label={'새로고침'}
							icon={<HiOutlineRefresh size={14} />}
							onClick={() => handleRefresh()}
						/>
						<Button
							label={'로그아웃'}
							icon={<MdLogout size={14} />}
							onClick={() => handleGoHome()}
						/>
					</>
				</Header>
				<Divider align={'horizontal'} color={'#a1a1a1'} />
			</div>

			<div className={styles.reportContentsLayout}>{memoizedReportDetails}</div>
		</div>
	);
}
const IssueTableHeader = ({
	type = 'defect',
}: {
	type?: 'defect' | 'improvements' | 'excludeDefects' | 'reopen';
}) => {
	return (
		<thead>
			<th>번호</th>
			{type === 'reopen' && <th>이슈 구분</th>}
			<th>설명</th>
			<th>키</th>
			<th>심각도</th>
			<th>처리 상태</th>
			{type !== 'improvements' && <th>결함 원인</th>}
			{type !== 'excludeDefects' && type !== 'reopen' && <th>삭제</th>}
			{type === 'reopen' && <th>재발생 버전</th>}
		</thead>
	);
};
