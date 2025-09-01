import { createContext, Suspense, useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import AccessTokenInput from './AccessTokenInput.tsx';
import Loading from '../../components/UiTools/Loading.tsx';

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
	const navigate = useNavigate();
	const [jira, setJira] = useState<{ token: string }>({
		token: localStorage.getItem('jiraToken') || '',
	});
	const [issue, setIssue] = useState<{
		type: 'epic' | 'issues' | null;
		key: string | null;
		checkList: string | null;
	}>({
		type: null,
		key: null,
		checkList: null,
	});

	const resetIssue = () => {
		setIssue({
			type: null,
			key: null,
			checkList: null,
		});
	};

	const handleSubmitToken = (token, issueKey, issueType, checkListKey) => {
		setJira({
			token: token,
		});
		setIssue({
			type: issueType,
			key: issueKey,
			checkList: checkListKey,
		});
		navigate(issueType === 'epic' ? '/report/epic' : '/report/issues', {
			state: {
				issueType: issueType,
				issueKey: issueKey,
				checkListKey: checkListKey,
			},
		});
	};

	if (!jira.token || !issue.type || !issue.key) {
		return (
			<AccessTokenInput
				onSubmitToken={(token, issueKey, issueType, checkListKey) => {
					const checkListKeys =
						checkListKey?.split(',').map((key) => key.trim()) || null;

					if (issueType === 'epic') {
						handleSubmitToken(token, issueKey, issueType, checkListKeys);
					} else if (issueType === 'issues') {
						const issueKeys = issueKey.split(',');

						handleSubmitToken(
							token,
							issueKeys.map((key) => key.trim()),
							issueType,
							checkListKeys,
						);
					}
				}}
			/>
		);
	}

	return (
		<div>
			<ReportPageContext.Provider value={{ resetIssue }}>
				<Suspense fallback={<Loading />}>
					<Outlet />
				</Suspense>
			</ReportPageContext.Provider>
		</div>
	);
}
