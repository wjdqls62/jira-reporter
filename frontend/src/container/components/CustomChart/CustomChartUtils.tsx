import type { PieLabelProps } from 'recharts/types/polar/Pie';

export const customPieChartLabel = ({
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
