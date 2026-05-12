import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeader, getAuthFromHeaders, JIRA_BASE_URL } from '@/lib/jira';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueKeys } = body;

    const auth = getAuthFromHeaders(request.headers);

    console.log(`이슈 조회 요청: ${issueKeys}`);
    console.log(`사용자명: ${auth?.username ? '제공됨' : '없음'}`);
    console.log(`비밀번호: ${auth?.password ? '제공됨' : '없음'}`);

    if (!auth) {
      console.log('인증 정보 누락');
      return NextResponse.json(
        {
          error: '인증 정보가 필요합니다. username과 password를 헤더에 포함해주세요.',
        },
        { status: 401 }
      );
    }

    if (!issueKeys || !Array.isArray(issueKeys) || issueKeys.length === 0) {
      return NextResponse.json(
        {
          error: 'issueKeys 배열이 필요합니다.',
        },
        { status: 400 }
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
        throw new Error(`JIRA API 요청 실패: ${response.status}`);
      }

      const searchData = await response.json();
      allIssues = allIssues.concat(searchData.issues || []);
    }

    return NextResponse.json({
      success: true,
      data: {
        issues: allIssues,
        total: allIssues.length,
        maxResults: allIssues.length,
        startAt: 0,
        isLast: true,
      },
    });
  } catch (error: any) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 400 }
    );
  }
}
