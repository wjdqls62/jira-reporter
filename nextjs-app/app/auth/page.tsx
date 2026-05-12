'use client';

import { useRouter } from 'next/navigation';
import AccessTokenInput from '@/components/container/pages/ReportPage/AccessTokenInput';

export default function AuthPage() {
	const router = useRouter();

	const handleSubmitToken = (
		token: string,
		issueKey: string | string[],
		issueType: 'epic' | 'issues',
		checkListKey: string[] | null,
	) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('jiraToken', token);
			localStorage.setItem(
				'issueKey',
				Array.isArray(issueKey) ? issueKey.join(',') : issueKey,
			);
			localStorage.setItem('issueType', issueType);
			localStorage.setItem('checkListKey', checkListKey ? checkListKey.join(',') : '');
		}

		router.push(`/report/${issueType}`);
	};

	return <AccessTokenInput onSubmitToken={handleSubmitToken} />;
}
