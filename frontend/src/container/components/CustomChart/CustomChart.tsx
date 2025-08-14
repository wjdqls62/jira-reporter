import React, { useState } from 'react';
import { Popover } from '@mui/material';
import { SketchPicker } from 'react-color';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';

import useChart from '../../hooks/useChart.ts';

import type { ISubIssue } from '../../../api/models/Epic.ts';

interface ColorPickerProps {
	id: string;
	open: boolean;
	color: string;
	onCommit: (color: string) => void;
	onClose: () => void;
}

interface ChartProps {
	width?: number;
	data: ISubIssue[];
	dataKey: string;
	chartType: 'causeOfDetect';
}

export default function CustomChart({ data, dataKey, chartType }: ChartProps) {
	const {
		changeBarColor,
		barColor,
		colorSelector,
		setColorSelector,
		setSelectedBarKey,
		selectedBarKey,
	} = useChart();
	// 드래그 중 부드러운 이동을 위한 로컬 피커 색상 상태
	const [pickerColor, setPickerColor] = useState<string>('');

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
					<Bar stackId={'bar'} dataKey={'value'} barSize={30}>
						{mappedData.map((bar) => {
							return (
								<>
									<Cell
										key={`cell-${bar[dataKey]}`}
										fill={barColor[String(bar[dataKey])] || '#fd4c4c'}
										onClick={(e) => {
											const key = String(bar[dataKey]);
											setSelectedBarKey(key);
											//setPickerColor(barColor[key] || '#fd4c4c');
											setColorSelector(true);
										}}
									/>
								</>
							);
						})}
					</Bar>
					<ColorPickerPopover
						id={dataKey}
						open={colorSelector}
						color={pickerColor}
						onClose={() => setColorSelector(false)}
						onCommit={(color) => {
							changeBarColor(selectedBarKey, color);
						}}
					/>
				</BarChart>
			);
		},
	};

	return (
		<ResponsiveContainer width={'100%'} height={400}>
			{chartRenderers[chartType]()}
		</ResponsiveContainer>
	);
}

const ColorPickerPopover = React.memo((props: ColorPickerProps) => {
	const { id, open, color, onCommit, onClose } = props;
	const [pickerColor, setPickerColor] = useState(color);

	const handleClose = () => {
		onClose();
	};

	return (
		<Popover
			id={`popover-${id}`}
			open={open}
			onClose={handleClose}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}>
			<SketchPicker
				color={pickerColor || '#fd4c4c'}
				onChange={(c) => {
					setPickerColor(c.hex);
				}}
				onChangeComplete={(c) => {
					onCommit(c.hex);
				}}
			/>
		</Popover>
	);
});
