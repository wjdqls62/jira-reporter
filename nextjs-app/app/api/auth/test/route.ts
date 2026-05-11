import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeader, getAuthFromHeaders, makeJiraRequest, JIRA_BASE_URL } from '@/lib/jira';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);

    console.log(`인증 테스트 요청`);
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
    const url = `${JIRA_BASE_URL}/rest/api/3/myself`;

    const userData = await makeJiraRequest(url, authHeader);

    return NextResponse.json({
      success: true,
      message: '인증이 성공했습니다.',
      user: {
        accountId: userData.accountId,
        displayName: userData.displayName,
        emailAddress: userData.emailAddress,
      },
    });
  } catch (error: any) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: '인증에 실패했습니다. 이메일 또는 API Token을 확인하세요.',
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 401 }
    );
  }
}
