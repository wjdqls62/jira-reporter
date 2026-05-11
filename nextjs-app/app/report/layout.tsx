'use client';

import Layout from '@/components/container/layout/Layout';

export default function ReportLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <Layout>{children}</Layout>;
}
