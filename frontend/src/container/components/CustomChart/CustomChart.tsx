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
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';

import styles from './CustomChart.module.scss';
import { defectPriority } from '../../../constants/Issue.ts';
import useChart from '../../hooks/useChart.ts';
import { Flex } from '../UiTools/UiTools.tsx';

import type { ISubIssue } from '../../../api/models/Epic.ts';
import type { PieLabelProps } from 'recharts/types/polar/Pie';

interface ColorPickerProps {
	id: string;
	open: boolean;
	color: string;
	onCommit: (color: string) => void;
	onChangeBarSize: (size: number) => void;
	onClose: () => void;
	currentBarSize: number;
}

interface ChartProps {
	width?: number;
	data: ISubIssue[];
	dataKey: string;
	type: 'causeOfDetect' | 'fixedRate';
}

export default function CustomChart({ data, dataKey, type }: ChartProps) {
	const {
		changeDefectReasonBarColor,
		changeDefectReasonPieColor,
		defectReasonChart,
		defectReasonPieChart,
		changeSelectedBarKey,
		changeCurrentType,
		changeFixedBarColor,
		fixedChart,
		toggleColorSelector,
		changeBarSize,
	} = useChart();
	// 드래그 중 부드러운 이동을 위한 로컬 피커 색상 상태
	const [pickerColor, setPickerColor] = useState<string>('');

	const renderColorPicker = (
		type: 'causeOfDetect' | 'causeOfDetectPie' | 'fixedRate',
	) => {
		const typeMap = {
			['causeOfDetect']: defectReasonChart.isColorSelector,
			['causeOfDetectPie']: defectReasonPieChart.isColorSelector,
			['fixedRate']: fixedChart.isColorSelector,
		};
		return (
			<ColorPickerModal
				id={dataKey}
				open={typeMap[type]}
				color={pickerColor}
				onClose={() => {
					toggleColorSelector(type);
				}}
				onCommit={(color) => {
					if (type === 'causeOfDetect') {
						changeDefectReasonBarColor(defectReasonChart.selectedBarKey, color);
					} else if (type === 'causeOfDetectPie') {
						changeDefectReasonPieColor(
							defectReasonPieChart.selectedBarKey,
							color,
						);
					} else if (type === 'fixedRate') {
						changeFixedBarColor(fixedChart.selectedBarKey, color);
					}
				}}
				onChangeBarSize={(size) => changeBarSize(type, size)}
				currentBarSize={
					type === 'causeOfDetect'
						? defectReasonChart.barSize
						: fixedChart.barSize
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
		'causeOfDetect' | 'causeOfDetect_Pie' | 'fixedRate',
		() => JSX.Element
	> = {
		causeOfDetect: () => {
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
								barSize={defectReasonChart.barSize}
								fill={defectReasonChart.barColor[priority] || '#fd4c4c'}
								onClick={(e) => {
									const key = priority;
									changeSelectedBarKey(key, 'causeOfDetect');
									setPickerColor(defectReasonChart.barColor[key] || '#fd4c4c');
									toggleColorSelector('causeOfDetect');
								}}
							/>
						);
					})}
					{renderColorPicker('causeOfDetect')}
				</BarChart>
			);
		},
		causeOfDetect_Pie: () => {
			//const counts = getCauseOfDefectCount();
			const pieData = Object.entries(getCauseOfDefectCount()).map(
				([name, value]) => {
					return {
						name: name,
						value: value,
					};
				},
			);

			const customPieLabel = ({
				cx,
				cy,
				midAngle,
				outerRadius,
				name,
				value,
			}: PieLabelProps) => {
				// 라벨을 원 바깥에 위치시키기 위한 거리 계산
				const RADIAN = Math.PI / 180;
				const radius = outerRadius + 30; // 원 바깥으로 20px 떨어진 위치
				const x = cx + radius * Math.cos(-midAngle * RADIAN);
				const y = cy + radius * Math.sin(-midAngle * RADIAN);

				// 텍스트 정렬 설정 (좌우 정렬)
				const textAnchor = x > cx ? 'start' : 'end';

				return (
					<text
						x={x}
						y={y}
						fill='#000000'
						fontSize={13}
						textAnchor={textAnchor}
						dominantBaseline='central'>
						{`${name} ${value}건`}
					</text>
				);
			};

			return (
				<PieChart>
					<Pie
						data={pieData}
						cy={200}
						innerRadius={100}
						paddingAngle={5}
						label={customPieLabel}>
						{pieData.map((entry) => (
							<Cell
								key={`cell-${entry.name}`}
								fill={defectReasonPieChart.barColor[entry.name.trim()]}
								onClick={() => {
									const key = entry.name.trim();
									changeSelectedBarKey(key, 'causeOfDetectPie');
									setPickerColor(defectReasonPieChart.barColor[key]);
									toggleColorSelector('causeOfDetectPie');
								}}
							/>
						))}
					</Pie>
					{renderColorPicker('causeOfDetectPie')}
				</PieChart>
			);
		},
		fixedRate: () => {
			const dataKeys = ['충돌', '장애', '중요함', '보통', '개선', '새 기능'];
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
					<YAxis
						yAxisId={'right'}
						orientation={'right'}
						domain={[0, 100]}
						tickFormatter={(v) => `${v}%`}
					/>
					<Bar
						stackId={'allIssue'}
						dataKey={'data.length'}
						fill={fixedChart.barColor.all}
						onClick={() => {
							changeSelectedBarKey('all', 'fixedRate');
							setPickerColor(fixedChart.barColor.fixed || '#fd4c4c');
							toggleColorSelector('fixedRate');
						}}
						barSize={fixedChart.barSize}
					/>
					<Bar
						stackId={'fixedIssue'}
						fill={fixedChart.barColor.fixed}
						dataKey={(obj) => {
							return obj.data.filter(
								(issue) => issue.status === '해결함' || issue.status === '닫힘',
							).length;
						}}
						onClick={(data, index, event) => {
							//changeSelectedBarKey('fixed');
							changeSelectedBarKey('fixed', 'fixedRate');
							setPickerColor(fixedChart.barColor.fixed || '#fd4c4c');
							toggleColorSelector('fixedRate');
						}}
						barSize={fixedChart.barSize}
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
					<Legend />

					{renderColorPicker('fixedRate')}
				</ComposedChart>
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
		currentBarSize,
	} = props;
	const [pickerColor, setPickerColor] = useState(color);

	const handleClose = () => {
		onClose();
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
					<div className={styles.barSizeSetting}>
						<label>
							막대 굵기
							<input
								type={'number'}
								defaultValue={currentBarSize}
								onChange={(e) => {
									onChangeBarSize(Number(e.target.value));
								}}
							/>
						</label>
					</div>
				</Flex>
			</div>
		</Modal>
	);
});
