import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import SnackbarProviderWrapper from '@/components/providers/SnackbarProviderWrapper';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'JIRA Reporter',
	description: 'JIRA 이슈 리포트 생성 도구',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='ko'
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
			<body className='min-h-full flex flex-col'>
				<Theme>
					<SnackbarProviderWrapper>{children}</SnackbarProviderWrapper>
				</Theme>
			</body>
		</html>
	);
}
