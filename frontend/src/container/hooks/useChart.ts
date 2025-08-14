import { useCallback, useState } from 'react';

export default function useChart() {
	const [barColor, setBarColor] = useState(initialBarColor);
	const [colorSelector, setColorSelector] = useState(false);
	const [selectedBarKey, setSelectedBarKey] = useState<string>('');

	const changeBarColor = useCallback((barKey: string, color: string) => {
		setBarColor((prev) => {
			return {
				...prev,
				[barKey]: color,
			};
		});
	}, []);

	return {
		changeBarColor,
		barColor,
		colorSelector,
		setColorSelector,
		selectedBarKey,
		setSelectedBarKey,
	};
}

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
