import type { CSSProperties } from 'react';

import styles from './CustomChart.module.scss';

import type { LegendProps } from 'recharts';

interface CustomLegendProps extends LegendProps {
	chartType: 'fixedChart' | 'defectReasonPieChart' | 'defectReasonChart';
}

interface LegendIconProps {
	width: number;
	height: number;
	type: 'rect' | 'line';
	color: string;
}

export const CustomLegend = (props: CustomLegendProps) => {
	return (
		<div className={styles.customLegend}>
			{props.payload.map((legend) => {
				const getLabel = () => {
					if (props.chartType === 'fixedChart') {
						return legendLabelMap['fixedChart'][
							legend.payload?.stackId || 'fixedRate'
						];
					} else if (props.chartType === 'defectReasonChart') {
						return legend.value.split('.')[1];
					}
				};

				return (
					<div key={'fixedChartLegend'} className={styles.fixedChartLegend}>
						<LegendIcon
							width={14}
							height={10}
							type={legend.payload.legendType}
							color={
								legend.payload.legendType === 'rect'
									? legend.payload.fill
									: legend.payload.stroke
							}
						/>
						<div>{getLabel()}</div>
					</div>
				);
			})}
		</div>
	);
};

const LegendIcon = ({ width = 14, height = 10, ...props }: LegendIconProps) => {
	const iconStyle = {
		width: `${width}px`,
		height: props.type === 'rect' ? `${height}px` : `3px`,
		backgroundColor: props.color,
	} as CSSProperties;
	return <div style={{ ...iconStyle }} />;
};

const legendLabelMap = {
	['fixedChart']: {
		['allIssue']: '전체 이슈',
		['fixedIssue']: '해결 이슈',
		['fixedRate']: '수정율',
	},
};
