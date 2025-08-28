import { useCallback, useState } from 'react';

interface DefectReasonState {
	isColorSelector: boolean;
	barColor: any;
	selectedBarKey: string;
	barSize: number;
}

interface FixedChartState extends DefectReasonState {
	selectedBarKey: 'all' | 'fixed';
}

interface RadarChartState {
	fill: string;
	opacity: number;
	stroke: string;
	isColorSelector: boolean;
}

export default function useChart() {
	const [chartState, setChartState] = useState<{
		defectReasonChart: DefectReasonState;
		defectReasonPieChart: DefectReasonState;
		defectReasonRadarChart: RadarChartState;
		fixedChart: FixedChartState;
	}>(initialChartStateValues);

	const clearColorSelector = useCallback(() => {
		setChartState((prev) => {
			return {
				defectReasonChart: {
					...prev.defectReasonChart,
					isColorSelector: false,
				},
				defectReasonPieChart: {
					...prev.defectReasonPieChart,
					isColorSelector: false,
				},
				fixedChart: {
					...prev.fixedChart,
					isColorSelector: false,
				},
				defectReasonRadarChart: {
					...prev.defectReasonRadarChart,
					isColorSelector: false,
				},
			};
		});
	}, []);

	const toggleColorSelector = useCallback(
		(type: 'defectReasonChart' | 'defectReasonPieChart' | 'fixedChart') => {
			setChartState((prev) => {
				return {
					...prev,
					[type]: {
						...prev[type as keyof typeof prev],
						isColorSelector: !prev[type as keyof typeof prev].isColorSelector,
					},
				};
			});
		},
		[],
	);

	const changeRadarSelectColorMode = useCallback((color: 'fill' | 'stroke') => {
		setChartState((prev) => {
			return {
				...prev,
				defectReasonRadarChart: {
					...prev.defectReasonRadarChart,
					colorSelectorMode: color,
				},
			};
		});
	}, []);

	const changeSelectedBarKey = useCallback((key: string, type: string) => {
		setChartState((prev) => {
			console.log(`key: ${key}, type: ${type}`);
			return {
				...prev,
				[type]: {
					...prev[type as keyof typeof prev],
					selectedBarKey: key,
					isColorSelector: !prev[type as keyof typeof prev].isColorSelector,
				},
			};
		});
	}, []);

	const changeBarSize = useCallback(
		(
			type: 'defectReasonChart' | 'defectReasonPieChart' | 'fixedRate',
			size: number,
		) => {
			setChartState((prev) => {
				return {
					...prev,
					[type]: {
						...prev[type as keyof typeof prev],
						barSize: size,
					},
				};
			});
		},
		[],
	);

	const changeRadarOpacity = useCallback((value: number) => {
		setChartState((prev) => {
			return {
				...prev,
				defectReasonRadarChart: {
					...prev.defectReasonRadarChart,
					opacity: value,
				},
			};
		});
	}, []);

	const changeCellColor = useCallback(
		(
			type:
				| 'defectReasonChart'
				| 'defectReasonPieChart'
				| 'fixedChart'
				| 'defectReasonRadarChart',
			barKey: string,
			color: string,
		) => {
			setChartState((prev) => {
				if (type !== 'defectReasonRadarChart') {
					return {
						...prev,
						[type]: {
							...prev[type as keyof typeof prev],
							barColor: {
								...prev[type as keyof typeof prev].barColor,
								[barKey]: color,
							},
						},
					};
				} else {
					return {
						...prev,
						defectReasonRadarChart: {
							...prev.defectReasonRadarChart,
							fill: color,
						},
					};
				}
			});
		},
		[],
	);

	return {
		changeCellColor,
		chartState,
		clearColorSelector,
		toggleColorSelector,
		changeSelectedBarKey,
		changeRadarOpacity,
		changeBarSize,
		changeRadarSelectColorMode,
	};
}

const fixedBarColorSet = {
	all: '#fd4c4c',
	fixed: '#4685ff',
};

const initialBarColor = {
	'단순 코딩 오류': '#fd4c4c',
	'알고리즘/로직 오류': '#fd4c4c',
	'아키텍쳐/설계 오류': '#fd4c4c',
	'UI/UX/사용성 오류': '#fd4c4c',
	'문구/메세지/인코딩 오류': '#fd4c4c',
	'기획 오류': '#fd4c4c',
	'스팩 정의 불분명': '#fd4c4c',
	'테스트 오류': '#fd4c4c',
	'빌드/패키지 오류': '#fd4c4c',
	'호환성/ 환경 dependency': '#fd4c4c',
	'SDK/API 오류': '#fd4c4c',
	'설치/동작 오류': '#fd4c4c',
	'내/외부 인터페이스 연계 오류': '#fd4c4c',
	'DB/Query': '#fd4c4c',
	'보안/취약점': '#fd4c4c',
	성능: '#fd4c4c',
	'내부관리용 이슈': '#fd4c4c',
	'재현되지 않음': '#fd4c4c',
	이슈아님: '#fd4c4c',
	기타: '#fd4c4c',
};

const initialBarColor2 = {
	['장애']: '#fd4c4c',
	['충돌']: '#777777',
	['중요함']: '#ff2ec8',
	['보통']: '#ff8833',
	['사소함']: '#ff9393',
};

const initialRadarColor = {
	fill: '#8884d8',
	opacity: 0.5,
	stroke: '#fff',
};

export const initialChartStateValues = {
	defectReasonChart: {
		isColorSelector: false,
		barColor: initialBarColor2,
		selectedBarKey: '',
		barSize: 15,
	} as DefectReasonState,
	defectReasonPieChart: {
		isColorSelector: false,
		barColor: initialBarColor,
		selectedBarKey: '',
		barSize: 15,
	} as DefectReasonState,
	fixedChart: {
		isColorSelector: false,
		barColor: fixedBarColorSet,
		selectedBarKey: 'all',
		barSize: 30,
	} as FixedChartState,
	defectReasonRadarChart: {
		...initialRadarColor,
		isColorSelector: false,
	} as RadarChartState,
};
