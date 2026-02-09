import { Section } from '../../../components/UiTools/UiTools.tsx';
import { IssueTableHeader } from '../ReportContents.tsx';
import { NavLink } from 'react-router-dom';
import styles from '../ReportPage.module.scss';
import type { ISubIssue } from '../../../../api/models/Epic.ts';
import { JIRA_BASE_BROWSE_URL } from '../../../../constants/Common.ts';

interface DefectDetailsProp {
	data: {
		defects: ISubIssue[];
		improvements: ISubIssue[];
		checkList: ISubIssue[];
	};
	handleDeleteIssue: (issue: ISubIssue) => void;
}

export const DefectDetails = ({
	data,
	handleDeleteIssue,
}: DefectDetailsProp) => {
	return (
		<Section
			title={
				<>
					<span>2. 주요 결함 내역</span>
				</>
			}>
			<table border={1}>
				<IssueTableHeader />
				<tbody>
					{data.defects
						.filter((issue) => issue.issueType === '결함')
						.map((issue, index) => {
							return (
								<tr key={index}>
									<td align={'center'}>{index + 1}</td>
									<td className={styles.issueTitle}>{issue.summary}</td>
									<td className={styles.issueKey} align={'center'}>
										<NavLink
											to={`${JIRA_BASE_BROWSE_URL}${issue.key}`}
											target={'_blank'}>
											{issue.key}
										</NavLink>
									</td>
									<td align={'center'}>{issue.defectPriority}</td>
									<td align={'center'}>{issue.status}</td>
									<td align={'center'} className={styles.causeOfDetect}>
										{issue.causeOfDetect.map((issue) => issue).join(', ')}
									</td>
									<td align={'center'}>
										<span
											className={styles.clickable}
											onClick={() => handleDeleteIssue(issue)}>
											❌
										</span>
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</Section>
	);
};

// TODO 주요 개선 내역 분리
export const ImprovementDetails = () => {};
