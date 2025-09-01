import type { CSSProperties } from 'react';
import { useFormContext } from 'react-hook-form';

interface SectionProps {
	title: string | React.ReactNode;
	children?: React.ReactNode;
	onTitleClick?: (e: React.MouseEvent) => void;
}

interface FlexProps {
	flexDirection?: 'row' | 'column';
	justifyContent?: string;
	alignItems?: string;
	gap?: number;
	width?: string;
	height?: string;
	children: React.ReactNode;
	onClick?: (e: React.MouseEvent) => void;
}

export const Flex = ({
	flexDirection = 'row',
	justifyContent = 'flex-start',
	alignItems = 'center',
	gap = 4,
	children,
	width,
	onClick,
}: FlexProps) => {
	const propStyles = {
		display: 'flex',
		flexDirection,
		justifyContent,
		alignItems,
		width: width ? width : '100%',
		gap: `${gap}px`,
	} as CSSProperties;
	return (
		<div
			style={{ ...propStyles, cursor: onClick && 'pointer' }}
			onClick={(e) => onClick && onClick(e)}>
			{children}
		</div>
	);
};

export const Section = ({ title, children, onTitleClick }: SectionProps) => {
	return (
		<Flex flexDirection={'column'} width={'100%'}>
			<Flex onClick={onTitleClick}>{title}</Flex>
			<Flex>{children}</Flex>
		</Flex>
	);
};

export const HelperText = ({ name }: { name: string }) => {
	const {
		formState: { errors },
	} = useFormContext();
	const errorMessage = errors[name]?.message as string | undefined;

	return (
		<div style={{ color: 'red', fontSize: '0.875rem', marginTop: '4px' }}>
			{errorMessage}
		</div>
	);
};
