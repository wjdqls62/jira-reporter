import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeader, getAuthFromHeaders, makeJiraRequest, JIRA_BASE_URL } from '@/lib/jira';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  const { issueKey } = await params;
  try {
    const auth = getAuthFromHeaders(request.headers);

    console.log(`이슈 조회 요청: ${issueKey}`);
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
    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;

    const issueData = await makeJiraRequest(url, authHeader);

    return NextResponse.json({
      success: true,
      data: issueData,
    });
  } catch (error: any) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);

    const statusMatch = error.message?.match(/(\d{3})$/);
    const jiraStatus = statusMatch ? parseInt(statusMatch[1]) : 500;

    const userMessage =
      jiraStatus === 404
        ? `입력한 이슈 키가 존재하지 않습니다. (${issueKey})`
        : jiraStatus === 401
          ? '인증 정보가 올바르지 않습니다.'
          : '이슈 조회 중 오류가 발생했습니다.';

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: jiraStatus }
    );
  }
}
