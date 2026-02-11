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

	const handleSubmitToken = (
		token: string,
		issueKey: string | string[],
		issueType: 'epic' | 'issues',
		checkListKey: string[] | null
	) => {
		setJira({ token });
		setIssue({
			type: issueType,
			key: issueKey,
			checkList: checkListKey,
		});
		navigate(issueType === 'epic' ? '/report/epic' : '/report/issues', {
			state: {
				issueType,
				issueKey,
				checkListKey,
			},
		});
	};

	if (!jira.token || !issue.type || !issue.key) {
		return (
			<AccessTokenInput onSubmitToken={handleSubmitToken} />
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
