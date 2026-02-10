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
import CustomChart from '../../components/CustomChart/CustomChart.tsx';
import Header from '../../components/Header/Header.tsx';
import Button from '../../components/UiTools/Button/Button.tsx';
import Divider from '../../components/UiTools/Divider.tsx';
import Loading from '../../components/UiTools/Loading.tsx';
import { Flex, Section } from '../../components/UiTools/UiTools.tsx';
import useJiraIssue from '../../hooks/useJiraIssue.ts';
import type { ISubIssue } from '../../../api/models/Epic.ts';
import useReportCalculator from '../../hooks/useReportCalculator.ts';
import TestSummary from './Sections/TestSummary.tsx';
import { DefectDetails } from './Sections/IssueDetails.tsx';

interface DataProps {
	defects: ISubIssue[];
	improvements: ISubIssue[];
	excludeDefects: ISubIssue[];
	checkList: ISubIssue[];
}

interface ChartTypesProps {
	defectReasonChart: 'bar' | 'pie' | 'radar';
}

const defaultDataValues = {
	defects: [],
	improvements: [],
	excludeDefects: [],
	checkList: [],
};

export default function ReportContents() {
	const { state } = useLocation();
	const { epicData, mutate, isValidating, isLoading } = useJiraIssue({
		issueKey: state.issueKey as string | string[],
		issueType: state.issueType as 'epic' | 'issues',
		checkListKey: state?.checkListKey || null,
	});

	const {
		hasCheckListIssue,
		hasReopenIssue,
		fixedIssueCount,
		priorityCount,
		issueCount,
		version: versions,
	} = useReportCalculator(epicData);

	const [data, setData] = useState<DataProps>(defaultDataValues);
	const { resetIssue } = useReportPage();

	const [chartTypes, setChartTypes] = useState<ChartTypesProps>({
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

	// TODO Chart 컴포넌트 분리
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

	const memoizedReportDetails = useMemo(() => {
		return (
			<Flex flexDirection={'column'} gap={50}>
				{/*테스트 요약*/}
				<TestSummary
					data={data}
					versions={versions}
					issueCount={issueCount}
					fixedIssueCount={fixedIssueCount}
					hasReopenIssue={hasReopenIssue}
					hasCheckListIssue={hasCheckListIssue}
					priorityCount={priorityCount}
				/>
				{/*주요 결함 내역*/}
				<DefectDetails data={data} handleDeleteIssue={handleDeleteIssue} />

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
												<tr key={`reopenIssue-${index}`}>
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
			// (부작업)개선, (부작업)결함, (부작업)새 기능에서 `(부작업)` 문자열 제거
			const convertChecklist = epicData.checkList.map((issue) => {
				return {
					...issue,
					issueType: issue.issueType.replace(/^\(부작업\)/, ''),
				};
			});

			setData({
				defects: epicData.defects,
				improvements: epicData.improvements,
				excludeDefects: epicData.excludeDefects,
				checkList: convertChecklist,
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
export const IssueTableHeader = ({
	type = 'defect',
}: {
	type?: 'defect' | 'improvements' | 'excludeDefects' | 'reopen';
}) => {
	return (
		<thead>
			<tr>
				<th>번호</th>
				{type === 'reopen' && <th>이슈 구분</th>}
				<th>설명</th>
				<th>키</th>
				<th>심각도</th>
				<th>처리 상태</th>
				{type !== 'improvements' && <th>결함 원인</th>}
				{type !== 'excludeDefects' && type !== 'reopen' && <th>삭제</th>}
				{type === 'reopen' && <th>재발생 버전</th>}
			</tr>
		</thead>
	);
};
