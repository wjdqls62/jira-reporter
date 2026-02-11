import React, { useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { HiOutlineRefresh } from 'react-icons/hi';
import { LuFileJson } from 'react-icons/lu';
import { MdLogout } from 'react-icons/md';
import { useLocation } from 'react-router-dom';

import CustomChart from '@/container/components/CustomChart/CustomChart.tsx';
import Header from '@/container/components/Header/Header';
import Button from '@/container/components/UiTools/Button/Button.tsx';
import Divider from '@/container/components/UiTools/Divider.tsx';
import Loading from '@/container/components/UiTools/Loading.tsx';
import { Flex, Section } from '@/container/components/UiTools/UiTools.tsx';
import useJiraIssue from '@/container/hooks/useJiraIssue.ts';
import useReportCalculator from '@/container/hooks/useReportCalculator.ts';
import { useReportPage } from '@/container/pages/ReportPage/ReportPage.tsx';
import {
	ExcludeDetails,
	IssueDetails,
	ReopenDetails,
} from '@/container/pages/ReportPage/Sections/IssueDetails.tsx';
import TestSummary from '@/container/pages/ReportPage/Sections/TestSummary.tsx';

import styles from './ReportPage.module.scss';

import type { ISubIssue } from '@/api/models/Epic.ts';

export interface DataProps {
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

	const [data, setData] = useState<DataProps>(defaultDataValues);
	const {
		hasCheckListIssue,
		hasReopenIssue,
		fixedIssueCount,
		priorityCount,
		issueCount,
		version: versions,
		defectActionRates,
		improvementsActionRates,
	} = useReportCalculator(data);
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

	const downloadJson = () => {
		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'issues.json';
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleJsonDownload = () => {
		downloadJson();
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
					defectActionRates={defectActionRates}
					improvementsActionRates={improvementsActionRates}
				/>

				{/* 주요 결함 내역, 주요 개선 내역 */}
				{['defects', 'improvements'].map((type) => {
					return (
						<IssueDetails
							key={type}
							type={type as 'defects' | 'improvements'}
							data={data}
							handleDeleteIssue={handleDeleteIssue}
						/>
					);
				})}

				{/* 재발생 이슈(QC), 재발생 이슈(확인 이슈) */}
				{['defect_improvement', 'checkList'].map((type) => (
					<ReopenDetails
						key={type}
						data={data}
						type={type as 'defect_improvement' | 'checkList'}
					/>
				))}

				{/* 집계 제외 이슈 */}
				<ExcludeDetails data={data} />

				<Section title={'7. 차트'}>
					<Flex flexDirection={'column'}>
						<Section
							title={
								<Flex>
									<Flex>
										<span>7-1. 결함 원인별 발생 현황</span>
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
						<Section title={'7-2. 이슈 중요도별 수정률'}>
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
			const convertChecklist = epicData?.checkList?.map((issue) => {
				return {
					...issue,
					issueType: issue.issueType.replace(/^\(부작업\)/, ''),
				};
			});

			setData({
				defects: epicData?.defects || [],
				improvements: epicData?.improvements || [],
				excludeDefects: epicData?.excludeDefects || [],
				checkList: convertChecklist || [],
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

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className={styles.reportContainer}>
			<div>
				<Divider align={'horizontal'} color={'#a1a1a1'} />
				<Header>
					<>
						<Button
							label={'JSON 다운로드'}
							icon={<LuFileJson />}
							onClick={handleJsonDownload}
						/>
						<Button label={'LLM 분석'} icon={<LuFileJson />} disabled={true} />
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
	type = 'defects',
}: {
	type?: 'defects' | 'improvements' | 'excludeDefects' | 'reopen';
}) => {
	return (
		<thead>
			<tr>
				<th>번호</th>
				{type === 'reopen' && <th>이슈 구분</th>}
				<th>설명</th>
				<th>키</th>
				<th>{type === 'improvements' ? '우선순위' : '심각도'}</th>
				<th>처리 상태</th>
				{type !== 'improvements' && <th>결함 원인</th>}
				{type !== 'excludeDefects' && type !== 'reopen' && <th>삭제</th>}
				{type === 'reopen' && <th>재발생 버전</th>}
			</tr>
		</thead>
	);
};
