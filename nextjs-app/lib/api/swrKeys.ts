export const SWR_KEYS = {
  inquiryIssue: (issueKey: string) => `/3/issue/${issueKey}`,
  inquiryMultipleIssue: () => {
    return `/issues/search`;
  },
  inquiryEpicIssue: (epicKey: string) => `/epic/${epicKey}/issues`,
  validateToken: `/auth/test`,
};
