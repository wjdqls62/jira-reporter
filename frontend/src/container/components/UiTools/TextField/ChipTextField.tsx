import type React, { CSSProperties } from 'react';

interface ChipTextFieldProps {
	value: string;
	backGroundColor?: string;
	fontColor?: string;
	fontSize?: number;
}

export const ChipTextField: React.FC<ChipTextFieldProps> = ({
	backGroundColor = '#fff',
	fontColor = 'black',
	fontSize = 11,
	value,
}) => {
	return (
		<div
			style={{
				...chipStyles,
				backgroundColor: backGroundColor,
				fontSize: fontSize,
				color: fontColor,
			}}>
			{value}
		</div>
	);
};

const chipStyles = {
	borderRadius: '8px',
	padding: '4px',
} as CSSProperties;
