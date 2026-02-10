import { defectPriority } from '../../../../constants/Issue.ts';
import { Section } from '../../../components/UiTools/UiTools.tsx';
import React from 'react';
import type { ISubIssue } from '../../../../api/models/Epic.ts';

interface TestSummaryProps {
	data: {
		defects: ISubIssue[];
		improvements: ISubIssue[];
		checkList: ISubIssue[];
	};
	versions: Set<string>;
	issueCount: {
		defects: number;
		checkList: {
			defect: number;
			improvements: number;
			works: number;
		};
	};
	fixedIssueCount: {
		defects: number;
		improvements: number;
		checkList: {
			defect: number;
			improvements: number;
			works: number;
		};
	};
	hasReopenIssue: {
		defects: boolean;
		improvements: boolean;
		checkListDefects: boolean;
		checkListImprovements: boolean;
		checkListWorks: boolean;
	};
	hasCheckListIssue: boolean;
	priorityCount: Record<string, number>;
}

export default function TestSummary({
	data,
	versions,
	issueCount,
	fixedIssueCount,
	hasReopenIssue,
	hasCheckListIssue,
	priorityCount,
}: TestSummaryProps) {
	return (
		<Section title={'1. 테스트 요약'}>
			<div>
				<table border={1}>
					<thead>
						<tr>
							<th colSpan={2}>구분</th>
							<th>내용</th>
							<th>비고</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan={2}>테스트 버전</td>
							<td>{Array.from(versions).join(', ')}</td>
							<td />
						</tr>
						<tr>
							<td colSpan={2}>테스트 기간</td>
							<td />
							<td>Working Day(n일)</td>
						</tr>
						{hasCheckListIssue && (
							<>
								<tr>
									<td
										rowSpan={(() => {
											let rowCount = 2; // 기본: 결함 조치율, 개선,새기능 조치율
											if (issueCount.checkList.works >= 1) rowCount++; // 작업, 부작업 조치율
											if (hasReopenIssue.checkListDefects) rowCount++; // 결함 재발생
											if (hasReopenIssue.checkListImprovements) rowCount++; // 개선,새기능 재발생
											if (hasReopenIssue.checkListWorks) rowCount++; // 작업,부작업 재발생
											return rowCount;
										})()}>
										확인 대상
									</td>
									<td rowSpan={hasReopenIssue.checkListDefects ? 2 : 1}>
										결함 조치율
									</td>
									<td rowSpan={hasReopenIssue.checkListDefects ? 2 : 1}>
										{(() => {
											const fixedRate =
												(fixedIssueCount.checkList.defect /
													issueCount.checkList.defect) *
												100;
											return `${fixedIssueCount.checkList.defect} / ${issueCount.checkList.defect} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
										})()}
									</td>
									<td>닫힘,해결 /전체</td>
								</tr>
								{hasReopenIssue.checkListDefects && (
									<tr>
										<td>
											{(() => {
												const reopenCount = data.checkList
													.filter((issue) => issue.issueType === '결함')
													.filter(
														(issue) => issue.reopenVersions.length >= 1,
													).length;
												const reopenIssueKeys = data.checkList
													.filter((issue) => issue.issueType === '결함')
													.filter((issue) => issue.reopenVersions.length >= 1)
													.map((issue) => issue.key);
												return (
													<>
														<div>{`재발생: ${reopenCount}건`}</div>
														<div>{`(${reopenIssueKeys.join(', ')})`}</div>
													</>
												);
											})()}
										</td>
									</tr>
								)}
								<tr>
									<td rowSpan={hasReopenIssue.checkListImprovements ? 2 : 1}>
										개선,새 기능 조치율
									</td>
									<td rowSpan={hasReopenIssue.checkListImprovements ? 2 : 1}>
										{(() => {
											const fixedRate =
												(fixedIssueCount.checkList.improvements /
													issueCount.checkList.improvements) *
												100;
											return `${fixedIssueCount.checkList.improvements} / ${issueCount.checkList.improvements} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
										})()}
									</td>
									<td>닫힘,해결 /전체(개선,새기능)</td>
								</tr>
								{hasReopenIssue.checkListImprovements && (
									<tr>
										<td>
											{(() => {
												const reopenCount = data.checkList
													.filter(
														(issue) =>
															issue.issueType === '개선' ||
															issue.issueType === '새 기능',
													)
													.filter(
														(issue) => issue.reopenVersions.length >= 1,
													).length;
												const reopenIssueKeys = data.checkList
													.filter(
														(issue) =>
															issue.issueType === '개선' ||
															issue.issueType === '새 기능',
													)
													.filter((issue) => issue.reopenVersions.length >= 1)
													.map((issue) => issue.key);
												return (
													<>
														<div>{`재발생: ${reopenCount}건`}</div>
														<div>{`(${reopenIssueKeys.join(', ')})`}</div>
													</>
												);
											})()}
										</td>
									</tr>
								)}
								{(() => {
									if (issueCount.checkList.works >= 1) {
										const fixedRate =
											(fixedIssueCount.checkList.works /
												issueCount.checkList.works) *
											100;
										return (
											<>
												<tr>
													<td rowSpan={hasReopenIssue.checkListWorks ? 2 : 1}>
														작업, 부작업 조치율
													</td>
													<td rowSpan={hasReopenIssue.checkListWorks ? 2 : 1}>
														{`${fixedIssueCount.checkList.works} / ${issueCount.checkList.works} = ${isNaN(fixedRate) ? 0 : fixedRate}%`}
													</td>
													<td>닫힘,해결 /전체(작업, 부작업)</td>
												</tr>
												{hasReopenIssue.checkListWorks && (
													<tr>
														<td>
															{(() => {
																const reopenCount = data.checkList
																	.filter(
																		(issue) =>
																			issue.issueType === '작업' ||
																			issue.issueType === '부작업',
																	)
																	.filter(
																		(issue) => issue.reopenVersions.length >= 1,
																	).length;
																const reopenIssueKeys = data.checkList
																	.filter(
																		(issue) =>
																			issue.issueType === '작업' ||
																			issue.issueType === '부작업',
																	)
																	.filter(
																		(issue) => issue.reopenVersions.length >= 1,
																	)
																	.map((issue) => issue.key);
																return (
																	<>
																		<div>{`재발생: ${reopenCount}건`}</div>
																		<div>
																			{`(${reopenIssueKeys.join(', ')})`}
																		</div>
																	</>
																);
															})()}
														</td>
													</tr>
												)}
											</>
										);
									}
								})()}
							</>
						)}
						<tr>
							<td rowSpan={6}>QC 이슈</td>
							<td>신규 등록 이슈</td>
							<td>{`${data.defects.length + data.improvements.length}건`}</td>
							<td>
								<div>{`결함: ${data.defects.length}건`}</div>
								<div>{`개선, 새기능: ${data.improvements.length}건`}</div>
							</td>
						</tr>
						{(() => {
							/*const hasReopenIssue = data.defects.some(
							(issue) => issue.reopenVersions.length >= 1,
						);*/
							return (
								<>
									<tr>
										<td rowSpan={2}>결함 조치율</td>
										<td rowSpan={2}>
											{`${fixedIssueCount.defects} / ${data.defects.length} = ${
												isNaN(
													(fixedIssueCount.defects / data.defects.length) * 100,
												)
													? 0
													: (
															(fixedIssueCount.defects / data.defects.length) *
															100
														).toFixed(2)
											}%`}
										</td>
										<td>닫힘, 해결 결함/신규 결함</td>
									</tr>
									<tr>
										<td>
											{hasReopenIssue.defects
												? (() => {
														const reopenCount = data.defects.filter(
															(issue) => issue.reopenVersions.length >= 1,
														).length;
														const reopenIssueKeys = new Set(
															data.defects
																.filter(
																	(issue) => issue.reopenVersions.length >= 1,
																)
																.flatMap((issue) => issue.key),
														);
														return (
															<>
																<div>{`재발생: ${reopenCount}건`}</div>
																<div>
																	{`(${Array.from(reopenIssueKeys)
																		.map((issue) => issue)
																		.join(', ')})`}
																</div>
															</>
														);
													})()
												: '-'}
										</td>
									</tr>
								</>
							);
						})()}
						<tr>
							<td rowSpan={2}>개선,새기능 조치율</td>
							<td rowSpan={2}>
								{`${fixedIssueCount.improvements} / ${data.improvements.length} = ${
									isNaN(
										Number(
											(
												(fixedIssueCount.improvements /
													data.improvements.length) *
												100
											).toFixed(2),
										),
									)
										? 0
										: Number(
												(fixedIssueCount.improvements /
													data.improvements.length) *
													100,
											).toFixed(2)
								}%`}
							</td>
							<td>닫힘, 해결(개선,새기능)/ 신규(개선,새기능)</td>
						</tr>
						<tr>
							<td>
								{hasReopenIssue.improvements
									? (() => {
											const reopenCount = data.improvements.filter(
												(issue) => issue.reopenVersions.length >= 1,
											);
											const reopenImprovementsKeys = new Set(
												data.improvements
													.filter((issue) => issue.reopenVersions.length >= 1)
													.flatMap((issue) => issue.key),
											);
											return (
												<>
													<div>재발생: {`${reopenCount.length}개`}</div>
													<div>
														{`(${Array.from(reopenImprovementsKeys)
															.map((issue) => issue)
															.join(', ')})`}
													</div>
												</>
											);
										})()
									: '-'}
							</td>
						</tr>
						<tr>
							<td>결함 심각도별 분포(유효한 결함 분석)</td>
							<td>
								<div>
									{defectPriority.map((type, index) => (
										<div
											key={`priority-${index}`}>{`${type}: ${priorityCount[type]}건`}</div>
									))}
								</div>
							</td>
							<td />
						</tr>
						{hasCheckListIssue && (
							<tr>
								<td rowSpan={2}>전체 이슈</td>
								<td>결함 조치율</td>
								<td>
									{(() => {
										const fixedRate =
											((fixedIssueCount.defects +
												fixedIssueCount.checkList.defect) /
												(issueCount.defects + issueCount.checkList.defect)) *
											100;
										return `${fixedIssueCount.defects + fixedIssueCount.checkList.defect} / ${issueCount.defects + issueCount.checkList.defect} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
									})()}
								</td>
								<td>확인대상(결함) + QC결함</td>
							</tr>
						)}
						{hasCheckListIssue && (
							<tr>
								<td>개선 조치율</td>
								<td>
									{(() => {
										const fixedRate =
											((fixedIssueCount.improvements +
												fixedIssueCount.checkList.improvements +
												fixedIssueCount.checkList.works) /
												(issueCount.improvements +
													issueCount.checkList.improvements +
													issueCount.checkList.works)) *
											100;
										return `${fixedIssueCount.improvements + fixedIssueCount.checkList.improvements + fixedIssueCount.checkList.works} / ${
											issueCount.improvements +
											issueCount.checkList.improvements +
											issueCount.checkList.works
										} = ${isNaN(fixedRate) ? 0 : fixedRate.toFixed(2)}%`;
									})()}
								</td>
								<td>{`확인대상 + 신규 개선,새기능${issueCount.checkList.works >= 1 ? ' + 작업, 부작업' : ''}`}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</Section>
	);
}
