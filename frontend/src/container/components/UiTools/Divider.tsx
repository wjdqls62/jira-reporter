import type { CSSProperties } from 'react';

interface DeviderProps {
	align: 'vertical' | 'horizontal';
	color?: string;
}

export default function Divider({ color = 'black', ...props }: DeviderProps) {
	const alignStyle =
		props.align === 'horizontal'
			? ({
					width: '100%',
					height: '1px',
				} as CSSProperties)
			: ({
					width: '1px',
					height: '100%',
				} as CSSProperties);

	return <div style={{ backgroundColor: color, ...alignStyle }} />;
}
