export const SWR_KEYS = {
	// 일반 이슈 조회
	inquiryIssue: (issueKey: string) => `/3/issue/${issueKey}`,
	inquiryMultipleIssue: () => {
		return `/issues/search`;
	},
	inquiryEpicIssue: (epicKey: string) =>
		`/epic/${epicKey}/issues`,
	validateToken: `/auth/test`,
};
