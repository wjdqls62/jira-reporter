export interface ISubIssue {
	id: string;
	key: string;
	parent: {
		key: string;
		summary: string;
		status: string;
	};
	versions: string[];
	fixVersions: string[];
	assignee: string;
	status: string;
	components: string[];
	reporter: string;
	defectPriority: string; //customfield_10044
	priority: string;
	issueType: string;
	resolutions: string;
	causeOfDetect: string[];
}
