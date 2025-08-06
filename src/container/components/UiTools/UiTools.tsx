import type { CSSProperties } from 'react';

interface SectionProps {
	title: string;
	children?: React.ReactNode;
}

interface FlexProps {
	flexDirection?: 'row' | 'column';
	justifyContent?: string;
	alignItems?: string;
	gap?: number;
	width?: string;
	height?: string;
	children: React.ReactNode;
}

export const Flex = ({
	flexDirection = 'row',
	justifyContent = 'flex-start',
	alignItems = 'center',
	gap = 4,
	children,
	width,
}: FlexProps) => {
	const propStyles = {
		display: 'flex',
		flexDirection,
		justifyContent,
		alignItems,
		width: width ? width : '100%',
		gap: `${gap}px`,
	} as CSSProperties;
	return <div style={propStyles}>{children}</div>;
};

export const Section = ({ title, children }: SectionProps) => {
	return (
		<Flex flexDirection={'column'} width={'100%'}>
			<Flex>{title}</Flex>
			<Flex>{children}</Flex>
		</Flex>
	);
};
