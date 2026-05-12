'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Flex, Text } from '@radix-ui/themes';

export default function Error({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const router = useRouter();

	useEffect(() => {
		console.error(error);
	}, [error]);

	const handleGoToAuth = () => {
		router.push('/auth');
	};

	return (
		<Flex
			direction='column'
			align='center'
			justify='center'
			style={{
				height: '100vh',
				padding: '2rem',
				textAlign: 'center',
			}}>
			<Text size='8' weight='bold' style={{ marginBottom: '1rem' }}>
				오류가 발생했습니다
			</Text>
			<Text size='3' color='gray' style={{ marginBottom: '2rem' }}>
				{error.message || '알 수 없는 오류가 발생했습니다.'}
			</Text>
			<Button
				color='gray'
				variant='solid'
				highContrast
				onClick={handleGoToAuth}
				style={{ cursor: 'pointer' }}>
				로그인 페이지로 이동
			</Button>
		</Flex>
	);
}
