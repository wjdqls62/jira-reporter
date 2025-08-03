import { useState } from 'react';

import AccessTokenInput from './AccessTokenInput.tsx';
import ReportContents from './ReportContents.tsx';

export default function ReportPage() {
	const [jira, setJira] = useState<{ token: string }>({
		token: localStorage.getItem('jiraToken') || '',
	});
	const [issue, setIssue] = useState<{
		type: 'epic' | 'issues' | null;
		key: string | null;
	}>({
		type: null,
		key: null,
	});

	const handleSubmitToken = (token, issueKey, issueType) => {
		setJira({
			token: token,
		});
		setIssue({
			type: issueType,
			key: issueKey,
		});
	};

	if (!jira.token || !issue.type || !issue.key) {
		return (
			<AccessTokenInput
				onSubmitToken={(token, issueKey, issueType) =>
					handleSubmitToken(token, issueKey, issueType)
				}
			/>
		);
	}

	if (jira.token && issue.type && issue.key) {
		return (
			<div>
				<ReportContents issueType={issue.type} issueKey={issue.key} />
			</div>
		);
	}
}
