import useSWRMutation from 'swr/mutation';

import { requestApi } from '../../api/apiClient.ts';
import { SWR_KEYS } from '../../api/swrKeys.ts';

import type { ISubIssue } from '../../api/models/Epic.ts';

interface Props {
	issueType: 'epic' | 'issues';
	issueKey: string | string[];
}

export default function useJiraIssue({ issueType, issueKey }: Props) {
	const { trigger: epicTrigger, data: epicData } = useSWRMutation(
		SWR_KEYS.inquiryEpicIssue(issueKey as string),
		async (url) => {
			const res = await requestApi('GET', url, {}, {});

			const subIssues = res.issues.map((issue) => {
				return {
					id: issue.id,
					key: issue.key,
					parent: {
						key: issue.fields.parent.key,
						summary: issue.fields.parent.fields.summary,
						status: issue.fields.parent.fields.status.name,
					},
					summary: issue.fields.summary,
					versions: issue.fields.versions,
					fixVersions: issue.fields.fixVersions,
					assignee: issue.fields.assignee?.displayName || '',
					status: issue.fields.status.name,
					components: issue.fields.components,
					reporter: issue.fields.reporter.displayName,
					priority: issue.fields.priority.name,
					issueType: issue.fields.issuetype.name,
				} as ISubIssue;
			});
			return subIssues;
		},
	);

	return { epicTrigger, epicData };
}
