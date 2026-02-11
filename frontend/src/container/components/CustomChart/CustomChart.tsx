import React, { useState } from 'react';
import { Modal } from '@mui/material';
import { SketchPicker } from 'react-color';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ComposedChart,
	Legend,
	Line,
	Pie,
	PieChart,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';

import { defectPriority } from '@/constants/Issue.ts';

import styles from './CustomChart.module.scss';
import { customPieChartLabel } from './CustomChartUtils.tsx';
import { CustomLegend } from './CustomLegend.tsx';
import useChart, {
	type initialChartStateValues,
} from '../../hooks/useChart.ts';
import { Flex } from '../UiTools/UiTools.tsx';

import type { ISubIssue } from '@/api/models/Epic.ts';

type ChartType =
	| 'defectReasonChart'
	| 'defectReasonPieChart'
	| 'defectReasonRadarChart'
	| 'fixedChart';

interface ColorPickerProps {
	id: string;
	type: ChartType;
	open: boolean;
	color: string;
	onCommit: (color: string) => void;
	onChangeBarSize: (size: number) => void;
	onChangeRadarOpacity?: (value: number) => void;
	onClose: () => void;
	currentBarSize: number;
	chartState: typeof initialChartStateValues;
}

interface ChartProps {
	width?: number;
	data: ISubIssue[];
	dataKey: string;
	type: ChartType;
}

export default function CustomChart({ data, dataKey, type }: ChartProps) {
	const {
		changeCellColor,
		chartState,
		changeSelectedBarKey,
		clearColorSelector,
		changeBarSize,
		changeRadarOpacity,
		changeRadarSelectColorMode,
	} = useChart();
	// 드래그 중 부드러운 이동을 위한 로컬 피커 색상 상태
	const [pickerColor, setPickerColor] = useState<string>('');

	const renderColorPicker = (
		type:
			| 'defectReasonChart'
			| 'defectReasonPieChart'
			| 'fixedChart'
			| 'defectReasonRadarChart',
	) => {
		return (
			<ColorPickerModal
				id={dataKey}
				type={type}
				open={chartState[type].isColorSelector}
				color={pickerColor}
				onClose={() => {
					clearColorSelector();
				}}
				onCommit={(color) => {
					if (type !== 'defectReasonRadarChart') {
						changeCellColor(type, chartState[type].selectedBarKey, color);
					} else {
						changeCellColor(type, null, color);
					}
				}}
				onChangeBarSize={(size) => changeBarSize(type, size)}
				onChangeRadarOpacity={(value) => {
					changeRadarOpacity(value);
				}}
				onChangeRadarColorSelectMode={(color) =>
					changeRadarSelectColorMode(color)
				}
				chartState={chartState}
				currentBarSize={
					type === 'defectReasonChart'
						? chartState.defectReasonChart.barSize
						: chartState.fixedChart.barSize
				}
			/>
		);
	};

	const getDefectPriorityCount = (
		data: ISubIssue[],
		priority: '장애' | '충돌' | '중요함' | '보통' | '사소함',
		name: string,
	) => {
		return data
			.filter((issue) => issue.causeOfDetect.includes(name))
			.filter((issue) => issue.defectPriority === priority).length;
	};

	const getCauseOfDefectCount = () => {
		const counts = (data || []).reduce(
			(acc, issue) => {
				(issue.causeOfDetect || []).forEach((cause) => {
					acc[cause] = (acc[cause] || 0) + 1;
				});
				return acc;
			},
			{} as Record<string, number>,
		);
		return counts;
	};

	const chartRenderers: Record<
		'defectReasonChart' | 'defectReasonPieChart' | 'fixedChart',
		'defectReasonRadarChart',
		() => JSX.Element
	> = {
		defectReasonChart: () => {
			const counts = getCauseOfDefectCount();

			const mappedData = Object.entries(counts).map(([name, value]) => {
				return {
					[dataKey]: name,
					value: value,
					priority: {
						장애: getDefectPriorityCount(data, '장애', name),
						충돌: getDefectPriorityCount(data, '충돌', name), // 충돌
						중요함: getDefectPriorityCount(data, '중요함', name), // 중요함
						보통: getDefectPriorityCount(data, '보통', name), // 보통
						사소함: getDefectPriorityCount(data, '사소함', name), // 사소함
					},
				};
			});

			return (
				<BarChart data={mappedData}>
					<XAxis dataKey={dataKey} interval={0} tickSize={1} />
					<YAxis />
					<CartesianGrid strokeDasharray={'3 3'} />
					{defectPriority.map((priority) => {
						return (
							<Bar
								key={`bar-${priority}`}
								stackId={`bar-${priority}`}
								dataKey={`priority.${priority}`}
								barSize={chartState.defectReasonChart.barSize}
								fill={
									chartState.defectReasonChart.barColor[priority] || '#fd4c4c'
								}
								onClick={(e) => {
									const key = priority;
									changeSelectedBarKey(key, 'defectReasonChart');
									setPickerColor(
										chartState.defectReasonChart.barColor[key] || '#fd4c4c',
									);
								}}
							/>
						);
					})}
					{renderColorPicker('defectReasonChart')}
					<Legend
						content={(props) => (
							<CustomLegend
								{...props}
								width={14}
								height={10}
								chartType={'defectReasonChart'}
							/>
						)}
					/>
				</BarChart>
			);
		},
		defectReasonPieChart: () => {
			const pieData = Object.entries(getCauseOfDefectCount()).map(
				([name, value]) => {
					return {
						name: name,
						value: value,
					};
				},
			);

			return (
				<PieChart>
					<Pie
						data={pieData}
						cy={200}
						innerRadius={100}
						paddingAngle={5}
						label={customPieChartLabel}>
						{pieData.map((entry) => (
							<Cell
								key={`cell-${entry.name}`}
								fill={
									chartState.defectReasonPieChart.barColor[entry.name.trim()]
								}
								onClick={() => {
									const key = entry.name.trim();
									changeSelectedBarKey(key, 'defectReasonPieChart');
									setPickerColor(chartState.defectReasonPieChart.barColor[key]);
								}}
							/>
						))}
					</Pie>
					{renderColorPicker('defectReasonPieChart')}
				</PieChart>
			);
		},
		fixedChart: () => {
			const dataKeys = [
				'충돌',
				'장애',
				'중요함',
				'보통',
				'사소함',
				'개선',
				'새 기능',
			];
			const filteredData = Object.entries(dataKeys).reduce(
				(acc, [key, value]) => {
					if (value === '개선' || value === '새 기능') {
						acc['개선, 새기능'] = [
							...(acc['개선, 새기능'] || []),
							...(data || []).filter((issue) => issue.issueType === value),
						];
					} else {
						acc[value] = (data || []).filter(
							(issue) => issue.defectPriority === value,
						);
					}
					return acc;
				},
				{},
			);
			const mappedData = Object.entries(filteredData).map(([key, value]) => {
				return {
					type: key,
					data: filteredData[key],
				};
			});

			return (
				<ComposedChart data={mappedData}>
					<CartesianGrid strokeDasharray={'3 3'} />
					<XAxis dataKey={'type'} />
					<YAxis />
					<YAxis
						yAxisId={'right'}
						orientation={'right'}
						domain={[0, 100]}
						tickFormatter={(v) => `${v}%`}
					/>
					<Bar
						stackId={'allIssue'}
						dataKey={'data.length'}
						fill={chartState.fixedChart.barColor.all}
						onClick={() => {
							changeSelectedBarKey('all', 'fixedChart');
							setPickerColor(chartState.fixedChart.barColor.fixed || '#fd4c4c');
						}}
						barSize={chartState.fixedChart.barSize}
					/>
					<Bar
						stackId={'fixedIssue'}
						fill={chartState.fixedChart.barColor.fixed}
						dataKey={(obj) => {
							return obj.data.filter(
								(issue) => issue.status === '해결함' || issue.status === '닫힘',
							).length;
						}}
						onClick={(data, index, event) => {
							changeSelectedBarKey('fixed', 'fixedChart');
							setPickerColor(chartState.fixedChart.barColor.fixed || '#fd4c4c');
						}}
						barSize={chartState.fixedChart.barSize}
					/>
					<Line
						type={'monotone'}
						dataKey={(obj) => {
							const total = obj?.data?.length ?? 0;
							if (!total) {
								return 0;
							}
							const fixedCounts = obj.data.filter(
								(issue) => issue.status === '해결함' || issue.status === '닫힘',
							);
							return (fixedCounts.length / total) * 100;
						}}
						yAxisId={'right'}
						stroke={'#51D64D'}
						strokeWidth={3}
					/>
					<Legend
						content={(props) => (
							<CustomLegend
								{...props}
								width={14}
								height={10}
								chartType={'fixedChart'}
							/>
						)}
					/>
					{renderColorPicker('fixedChart')}
				</ComposedChart>
			);
		},
		defectReasonRadarChart: () => {
			const counts = getCauseOfDefectCount();
			const mappedData = Object.entries(counts).map(([name, value]) => {
				return {
					name: name,
					value: value,
				};
			});

			return (
				<RadarChart data={mappedData}>
					<PolarGrid />
					<PolarAngleAxis dataKey={'name'} />
					<PolarRadiusAxis />
					<Radar
						dataKey={'value'}
						stroke={chartState.defectReasonRadarChart.stroke}
						fill={chartState.defectReasonRadarChart.fill}
						fillOpacity={chartState.defectReasonRadarChart.opacity}
						onClick={() => {
							changeSelectedBarKey('radar', 'defectReasonRadarChart');
							setPickerColor(chartState.defectReasonRadarChart.fill);
						}}
					/>
					{renderColorPicker('defectReasonRadarChart')}
				</RadarChart>
			);
		},
	};

	return (
		<ResponsiveContainer width={'100%'} height={400}>
			{chartRenderers[type]()}
		</ResponsiveContainer>
	);
}

const ColorPickerModal = React.memo((props: ColorPickerProps) => {
	const {
		id,
		open,
		color,
		onCommit,
		onClose,
		onChangeBarSize,
		onChangeRadarOpacity,
		type,
		chartState,
	} = props;
	const [pickerColor, setPickerColor] = useState(color);

	const handleClose = () => {
		onClose();
	};

	const renderOptions = () => {
		if (type === 'fixedChart' || type === 'defectReasonChart') {
			return (
				<>
					<label>
						막대 굵기
						<input
							type={'number'}
							defaultValue={chartState[type].barSize}
							onChange={(e) => {
								onChangeBarSize(Number(e.target.value));
							}}
						/>
					</label>
				</>
			);
		} else if (type === 'defectReasonRadarChart') {
			return (
				<Flex flexDirection={'column'}>
					<label>
						투명도
						<input
							type={'number'}
							defaultValue={chartState.defectReasonRadarChart.opacity}
							step={0.1}
							min={0.1}
							max={1}
							onChange={(e) => onChangeRadarOpacity(Number(e.target.value))}
						/>
					</label>
				</Flex>
			);
		}
	};

	return (
		<Modal id={`popover-${id}`} open={open} onClose={handleClose}>
			<div className={styles.chartSettingModal}>
				<Flex
					flexDirection={'column'}
					width={'100%'}
					alignItems={'baseline'}
					gap={20}>
					<SketchPicker
						color={pickerColor || '#fd4c4c'}
						onChange={(c) => {
							setPickerColor(c.hex);
						}}
						onChangeComplete={(c) => {
							onCommit(c.hex);
						}}
					/>
					<div className={styles.barSizeSetting}>{renderOptions()}</div>
				</Flex>
			</div>
		</Modal>
	);
});
