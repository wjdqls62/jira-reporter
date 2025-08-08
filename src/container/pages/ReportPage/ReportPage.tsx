import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import AccessTokenInput from './AccessTokenInput.tsx';
import Loading from '../../components/UiTools/Loading.tsx';

export default function ReportPage() {
	const navigate = useNavigate();
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
		navigate(issueType === 'epic' ? '/report/epic' : '/report/issues', {
			state: {
				issueType: issueType,
				issueKey: issueKey,
			},
		});
	};

	if (!jira.token || !issue.type || !issue.key) {
		return (
			<AccessTokenInput
				onSubmitToken={(token, issueKey, issueType) => {
					if (issueType === 'epic') {
						handleSubmitToken(token, issueKey, issueType);
					} else if (issueType === 'issues') {
						const issueKeys = issueKey.split(',');
						handleSubmitToken(
							token,
							issueKeys.map((key) => key.trim()),
							issueType,
						);
					}
				}}
			/>
		);
	}

	return (
		<div>
			<Suspense fallback={<Loading />}>
				<Outlet />
			</Suspense>
		</div>
	);
}
