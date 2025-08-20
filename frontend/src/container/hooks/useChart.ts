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

export default function useChart() {
	const [defectReasonChart, setDefectReasonChart] = useState<DefectReasonState>(
		{
			isColorSelector: false,
			barColor: initialBarColor2,
			selectedBarKey: '',
			barSize: 15,
		},
	);
	const [fixedChart, setFixedChart] = useState<FixedChartState>({
		isColorSelector: false,
		barColor: fixedBarColorSet,
		selectedBarKey: 'all',
		barSize: 30,
	});

	const toggleColorSelector = useCallback(
		(chartType: 'causeOfDetect' | 'fixedRate') => {
			if (chartType === 'causeOfDetect') {
				setDefectReasonChart((prev) => {
					return {
						...prev,
						isColorSelector: !prev.isColorSelector,
					};
				});
			} else if (chartType === 'fixedRate') {
				setFixedChart((prev) => {
					return {
						...prev,
						isColorSelector: !prev.isColorSelector,
					};
				});
			}
		},
		[],
	);

	const changeSelectedBarKey = useCallback((key: string) => {
		const causeOfDetectColorSet = Object.entries(initialBarColor2).map(
			([key, value]) => key,
		);
		if (causeOfDetectColorSet.includes(key)) {
			setDefectReasonChart((prev) => {
				return {
					...prev,
					selectedBarKey: key,
				};
			});
		} else {
			setFixedChart((prev) => {
				return {
					...prev,
					selectedBarKey: key,
				};
			});
		}
	}, []);

	const changeBarSize = useCallback(
		(type: 'causeOfDetect' | 'fixedRate', size: number) => {
			if (type === 'causeOfDetect') {
				setDefectReasonChart((prev) => {
					return {
						...prev,
						barSize: size,
					};
				});
			} else {
				setFixedChart((prev) => {
					return {
						...prev,
						barSize: size,
					};
				});
			}
		},
		[],
	);

	const changeDefectReasonBarColor = useCallback(
		(barKey: string, color: string) => {
			setDefectReasonChart((prev) => {
				return {
					...prev,
					barColor: {
						...prev.barColor,
						[barKey]: color,
					},
				};
			});
		},
		[],
	);

	const changeFixedBarColor = useCallback((barKey: string, color: string) => {
		setFixedChart((prev) => {
			return {
				...prev,
				barColor: {
					...prev.barColor,
					[barKey]: color,
				},
			};
		});
	}, []);

	return {
		changeDefectReasonBarColor,
		defectReasonChart,
		fixedChart,
		toggleColorSelector,
		changeSelectedBarKey,
		changeFixedBarColor,
		changeBarSize,
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
