import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeader, getAuthFromHeaders, makeJiraRequest, JIRA_BASE_URL, maxResults } from '@/lib/jira';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ epicKey: string }> }
) {
  try {
    const { epicKey } = await params;
    const auth = getAuthFromHeaders(request.headers);

    console.log(`Epic 이슈 조회 요청: ${epicKey}`);
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

    const authHeader = createAuthHeader(auth.username, auth.password);
    const url = `${JIRA_BASE_URL}/rest/agile/1.0/epic/${epicKey}/issue?maxResults=${maxResults}`;

    const epicIssues = await makeJiraRequest(url, authHeader);

    return NextResponse.json({
      success: true,
      data: epicIssues,
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
      { status: 500 }
    );
  }
}
