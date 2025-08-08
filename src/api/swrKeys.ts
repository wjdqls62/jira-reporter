export const SWR_KEYS = {
	// 일반 이슈 조회
	inquiryIssue: (issueKey: string) => `/3/issue/${issueKey}`,
	inquiryMultipleIssue: (issueKeys: string[]) => {
		const splitIssueKeys = issueKeys.join(',');
		return `/api/3/search?jql=issueKey%20in%20(${splitIssueKeys})`;
	},
	inquiryEpicIssue: (epicKey: string, startAt: number = 0) =>
		`/agile/1.0/epic/${epicKey}/issue?startAt=${startAt}&maxResults=150`,
	validateToken: `/api/3/myself`,
};
