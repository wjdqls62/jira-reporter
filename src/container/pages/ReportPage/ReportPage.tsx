import { useState } from 'react';

import AccessTokenInput from './AccessTokenInput.tsx';

export default function ReportPage() {
	const [jiraToken, setJiraToken] = useState('')

	if(!jiraToken) {
		return <AccessTokenInput onSubmitToken={setJiraToken} />
	}

	return (
		<div>
			<h2>Access Token</h2>
			<div>{jiraToken}</div>
		</div>
	)
}

