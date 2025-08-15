import React, { useState } from 'react';
import { Modal } from '@mui/material';
import { SketchPicker } from 'react-color';
import { Simulate } from 'react-dom/test-utils';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';

import styles from './CustomChart.module.scss';
import useChart from '../../hooks/useChart.ts';
import { Flex } from '../UiTools/UiTools.tsx';

import type { ISubIssue } from '../../../api/models/Epic.ts';

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
		defectReasonChart,
		changeSelectedBarKey,
		changeFixedBarColor,
		fixedChart,
		toggleColorSelector,
		changeBarSize,
	} = useChart();
	// 드래그 중 부드러운 이동을 위한 로컬 피커 색상 상태
	const [pickerColor, setPickerColor] = useState<string>('');

	const renderColorPicker = (type: 'causeOfDetect' | 'fixedRate') => {
		return (
			<ColorPickerModal
				id={dataKey}
				open={
					type === 'causeOfDetect'
						? defectReasonChart.isColorSelector
						: fixedChart.isColorSelector
				}
				color={pickerColor}
				onClose={() =>
					toggleColorSelector(
						type === 'causeOfDetect' ? 'causeOfDetect' : 'fixedRate',
					)
				}
				onCommit={(color) => {
					console.log(`onCommit: ${color}, type: ${type}`);
					type === 'causeOfDetect'
						? changeDefectReasonBarColor(
								defectReasonChart.selectedBarKey,
								color,
							)
						: changeFixedBarColor(fixedChart.selectedBarKey, color);
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

	const chartRenderers: Record<'causeOfDetect', () => JSX.Element> = {
		causeOfDetect: () => {
			const counts = (data || []).reduce(
				(acc, issue) => {
					(issue.causeOfDetect || []).forEach((cause) => {
						acc[cause] = (acc[cause] || 0) + 1;
					});
					return acc;
				},
				{} as Record<string, number>,
			);
			const mappedData = Object.entries(counts).map(([name, value]) => ({
				[dataKey]: name,
				value,
			}));

			return (
				<BarChart data={mappedData}>
					<XAxis dataKey={dataKey} interval={0} tickSize={1} />
					<YAxis />
					<CartesianGrid strokeDasharray={'3 3'} />
					<Bar
						stackId={'bar'}
						dataKey={'value'}
						barSize={defectReasonChart.barSize}>
						{mappedData.map((bar) => {
							return (
								<>
									<Cell
										key={`cell-${bar[dataKey]}`}
										fill={
											defectReasonChart.barColor[String(bar[dataKey])] ||
											'#fd4c4c'
										}
										onClick={(e) => {
											const key = String(bar[dataKey]);
											changeSelectedBarKey(key);
											setPickerColor(
												defectReasonChart.barColor[key] || '#fd4c4c',
											);
											toggleColorSelector('causeOfDetect');
										}}
									/>
								</>
							);
						})}
					</Bar>
					{renderColorPicker('causeOfDetect')}
				</BarChart>
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
							changeSelectedBarKey('all');
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
							changeSelectedBarKey('fixed');
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
