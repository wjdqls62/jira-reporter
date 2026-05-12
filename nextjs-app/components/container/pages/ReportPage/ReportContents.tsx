'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import styles from './ReportPage.module.scss';
import { ISubIssue } from '@/lib/api/models/Epic';
import { calculateReportMetrics } from '@/lib/reportCalculator';
import { useReportPage } from '@/components/container/pages/ReportPage/ReportPage';
import CustomChart from '@/components/container/components/CustomChart/CustomChart';
import {
	Flex,
	Section,
} from '@/components/container/components/UiTools/UiTools';
import TestSummary from '@/components/container/pages/ReportPage/Sections/TestSummary';
import {
	ExcludeDetails,
	IssueDetails,
	ReopenDetails,
} from './Sections/IssueDetails';
import Loading from '@/components/container/components/UiTools/Loading';
import Divider from '@/components/container/components/UiTools/Divider';
import Header from '@/components/container/components/Header/Header';
import useJiraIssue from '@/components/container/hooks/useJiraIssue';
import { Button, Select } from '@radix-ui/themes';
import { Spinner, Text } from '@radix-ui/themes/dist/esm';

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

interface ReportContentsProps {
	issueType: 'epic' | 'issues';
	issueKey: string | string[];
	checkListKey: string[] | null;
}

export default function ReportContents({
	issueType,
	issueKey,
	checkListKey,
}: ReportContentsProps) {
	const { epicData, mutate, isValidating, isLoading, error } = useJiraIssue({
		issueKey,
		issueType,
		checkListKey: checkListKey ? checkListKey.join(',') : null,
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
	} = useMemo(() => calculateReportMetrics(data), [data]);
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
		if (typeof window !== 'undefined') {
			localStorage.removeItem('jiraToken');
			localStorage.removeItem('issueKey');
			localStorage.removeItem('issueType');
			localStorage.removeItem('checkListKey');
		}
		resetIssue();
		window.location.href = `/report/${issueType}`;
	};

	const handleChangeCauseOfDetectType = (value: string) => {
		setChartTypes((prev) => {
			return {
				...prev,
				defectReasonChart: value as 'bar' | 'pie' | 'radar',
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
										<Select.Root
											size={'1'}
											defaultValue={'bar'}
											onValueChange={(value) =>
												handleChangeCauseOfDetectType(value)
											}>
											<Select.Trigger />
											<Select.Content>
												<Select.Item value={'bar'}>막대 그래프</Select.Item>
												<Select.Item value={'pie'}>원형 그래프</Select.Item>
												<Select.Item value={'radar'}>레이더 차트</Select.Item>
											</Select.Content>
										</Select.Root>
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

		if (epicData && checkListKey !== null && epicData.checkList.length === 0) {
			enqueueSnackbar('확인 이슈 검색 결과가 없습니다.', {
				variant: 'warning',
				autoHideDuration: 3000,
				preventDuplicate: true,
				anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
			});
		}
	}, [epicData]);

	useEffect(() => {
		if (error?.response?.status === 500) {
			throw error;
		}
	}, [error]);

	if (isLoading || isValidating) {
		return <Loading />;
	}

	return (
		<div className={styles.reportContainer}>
			<div>
				<Divider align={'horizontal'} color={'#a1a1a1'} />
				<Header>
					<>
						<Button
							color='gray'
							variant='solid'
							style={{ cursor: 'pointer' }}
							onClick={handleJsonDownload}
							highContrast>
							<Text as={'span'} size={'1'}>
								JSON 다운로드
							</Text>
						</Button>
						<Button
							color='gray'
							variant='solid'
							style={{ cursor: 'pointer' }}
							onClick={() => handleRefresh()}
							highContrast>
							<Text as={'span'} size={'1'}>
								JSON 새로고침
							</Text>
						</Button>
						<Button
							color='gray'
							variant='solid'
							style={{ cursor: 'pointer' }}
							onClick={() => handleGoHome()}
							highContrast>
							<Text as={'span'} size={'1'}>
								로그아웃
							</Text>
						</Button>
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
