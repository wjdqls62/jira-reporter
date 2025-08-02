import { useState } from 'react';

import AccessTokenInput from './AccessTokenInput.tsx';

export default function ReportPage() {
	const jiraToken = localStorage.getItem('jiraToken');
	const [hasJiraToken, setHasJiraToken] = useState<boolean>(jiraToken ? true : false);

	if(!hasJiraToken) {
		return <AccessTokenInput onSubmitToken={() => setHasJiraToken(true)} />
	}

	if(hasJiraToken) {
		return (
			<div>
				<h2>Access Token</h2>
				<div>{jiraToken}</div>
			</div>
		)
	}
}

