'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ReportContents from './ReportContents';

interface ReportState {
	resetIssue: () => void;
}

const ReportPageContext = createContext<ReportState>({
	resetIssue: () => {},
});

export const useReportPage = () => {
	const context = useContext(ReportPageContext);
	return context;
};

export default function ReportPage() {
	const router = useRouter();
	const [issue, setIssue] = useState<{
		type: 'epic' | 'issues' | null;
		key: string | string[] | null;
		checkList: string[] | null;
	}>({
		type: null,
		key: null,
		checkList: null,
	});

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedToken = localStorage.getItem('jiraToken') || '';
			const storedIssueKey = localStorage.getItem('issueKey') || '';
			const storedIssueType = localStorage.getItem('issueType') as
				| 'epic'
				| 'issues'
				| null;
			const storedCheckListKey = localStorage.getItem('checkListKey') || '';

			if (!storedToken || !storedIssueKey || !storedIssueType) {
				router.push('/auth');
				return;
			}

			const parsedCheckList = storedCheckListKey
				? storedCheckListKey
						.split(',')
						.map((k) => k.trim())
						.filter((k) => k !== '')
				: null;
			const parsedIssueKey =
				storedIssueType === 'epic'
					? storedIssueKey
					: storedIssueKey.split(',').map((k) => k.trim());

			setIssue({
				type: storedIssueType,
				key: parsedIssueKey,
				checkList: parsedCheckList,
			});
		}
	}, [router]);

	const resetIssue = () => {
		setIssue({
			type: null,
			key: null,
			checkList: null,
		});
	};

	if (!issue.type || !issue.key) {
		return null;
	}

	return (
		<div>
			<ReportPageContext.Provider value={{ resetIssue }}>
				<ReportContents
					issueType={issue.type}
					issueKey={issue.key}
					checkListKey={issue.checkList}
				/>
			</ReportPageContext.Provider>
		</div>
	);
}
