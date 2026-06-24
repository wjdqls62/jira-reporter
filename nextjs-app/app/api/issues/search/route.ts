import { NextRequest, NextResponse } from 'next/server';
import {
	createAuthHeader,
	getAuthFromHeaders,
	JIRA_BASE_URL,
} from '@/lib/jira';

export async function POST(request: NextRequest) {
	try {
		console.log('\n========== /api/issues/search 요청 시작 ==========');
		const body = await request.json();
		let { issueKeys } = body;

		// issueKeys가 문자열인 경우 배열로 변환
		if (typeof issueKeys === 'string') {
			issueKeys = issueKeys
				.split(',')
				.map((key) => key.trim())
				.filter((key) => key.length > 0);
			console.log('[DEBUG] issueKeys:', issueKeys);
		}

		const auth = getAuthFromHeaders(request.headers);

		console.log(`이슈 조회 요청: ${issueKeys}`);
		console.log(`사용자명: ${auth?.username ? '제공됨' : '없음'}`);
		console.log(`비밀번호: ${auth?.password ? '제공됨' : '없음'}`);

		if (!auth) {
			console.log('인증 정보 누락');
			return NextResponse.json(
				{
					error:
						'인증 정보가 필요합니다. username과 password를 헤더에 포함해주세요.',
				},
				{ status: 401 },
			);
		}

		if (!issueKeys || !Array.isArray(issueKeys) || issueKeys.length === 0) {
			console.log('[DEBUG] issueKeys 검증 실패:', {
				issueKeys,
				isArray: Array.isArray(issueKeys),
				length: issueKeys?.length,
			});
			return NextResponse.json(
				{
					error: 'issueKeys 배열이 필요합니다.',
				},
				{ status: 400 },
			);
		}

		const authHeader = createAuthHeader(auth.username, auth.password);
		const url = `${JIRA_BASE_URL}/rest/api/3/search/jql`;

		const JIRA_MAX_RESULTS = 100;
		let allIssues: any[] = [];

		for (let i = 0; i < issueKeys.length; i += JIRA_MAX_RESULTS) {
			const batchKeys = issueKeys.slice(i, i + JIRA_MAX_RESULTS);

			const requestBody = {
				jql: `issueKey IN (${batchKeys.join(', ')})`,
				fields: ['*all'],
				maxResults: JIRA_MAX_RESULTS,
			};
			console.log('[DEBUG] JIRA API 요청:', {
				batch: i / JIRA_MAX_RESULTS + 1,
				batchSize: batchKeys.length,
				jql: requestBody.jql,
			});

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: authHeader,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('[DEBUG] JIRA API 에러 응답:', {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
				});
				throw new Error(
					`JIRA API 요청 실패: ${response.status} - ${errorText}`,
				);
			}

			const searchData = await response.json();
			allIssues = allIssues.concat(searchData.issues || []);
		}

		console.log('[DEBUG] 요청 성공:', { totalIssues: allIssues.length });
		console.log('========== /api/issues/search 요청 완료 ==========\n');
		return NextResponse.json({
			success: true,
			data: {
				issues: allIssues,
				maxResults: allIssues.length,
				startAt: 0,
				isLast: true,
			},
		});
	} catch (error: any) {
		console.error('[DEBUG] API 에러 발생:', {
			message: error.message,
			name: error.name,
			stack: error.stack,
		});
		console.log('========== /api/issues/search 요청 실패 ==========\n');

		// "JIRA API 요청 실패: {status} - {errorText}" 또는 "JIRA API 요청 실패: {status}" 패턴 파싱
		const statusMatch = error.message?.match(/:\s*(\d{3})/);
		const jiraStatus = statusMatch ? parseInt(statusMatch[1]) : 500;

		const userMessage =
			jiraStatus === 404
				? '존재하지 않는 이슈 키가 포함되어 있습니다.'
				: jiraStatus === 401
					? '인증 정보가 올바르지 않습니다.'
					: '이슈 조회 중 오류가 발생했습니다.';

		return NextResponse.json(
			{ success: false, error: userMessage },
			{ status: jiraStatus },
		);
	}
}
