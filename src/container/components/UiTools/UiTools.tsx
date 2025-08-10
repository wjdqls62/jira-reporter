import type { CSSProperties } from 'react';
import { useFormContext } from 'react-hook-form';

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
