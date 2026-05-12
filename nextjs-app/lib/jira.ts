const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://jsdev.atlassian.net';
const maxResults = 150;

export function createAuthHeader(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${token}`;
}

export async function makeJiraRequest(url: string, authHeader: string) {
  console.log(`@@@ authHeader: ${authHeader}`);
  try {
    console.log(`JIRA API 요청: ${url}`);
    console.log(`인증 헤더: ${authHeader.substring(0, 20)}...`);
    console.log(`JIRA 베이스 URL: ${JIRA_BASE_URL}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('JIRA API 요청 오류 상세:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        url: url,
        baseUrl: JIRA_BASE_URL
      });
      throw new Error(`JIRA API 요청 실패: ${response.status}`);
    }

    console.log(`JIRA API 응답 성공: ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('JIRA API 요청 오류:', {
      message: error.message,
      url: url,
      baseUrl: JIRA_BASE_URL
    });
    throw new Error(`JIRA API 요청 실패: ${error.message}`);
  }
}

export function getAuthFromHeaders(headers: Headers): { username: string; password: string } | null {
  const username = headers.get('username') || headers.get('x-username') || '';
  const password = headers.get('password') || headers.get('x-password') || '';

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export { JIRA_BASE_URL, maxResults };
