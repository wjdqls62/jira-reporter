const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const maxResults = 150;

// CORS 설정 개선
app.use(cors({
  origin: true, // 모든 origin 허용 (개발용)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'username', 'password', 'x-username', 'x-password']
}));

// 미들웨어 설정
app.use(express.json());

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// JIRA API 기본 URL (환경변수로 설정 가능)
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://jsdev.atlassian.net';

// Basic Auth 헤더 생성 함수
function createAuthHeader(username, password) {
  const token = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${token}`;
}

// 공통 JIRA API 요청 함수
async function makeJiraRequest(url, authHeader) {
  console.log(`@@@ authHeader: ${authHeader}`);
  try {
    console.log(`JIRA API 요청: ${url}`);
    console.log(`인증 헤더: ${authHeader.substring(0, 20)}...`);
    console.log(`JIRA 베이스 URL: ${JIRA_BASE_URL}`);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log(`JIRA API 응답 성공: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error('JIRA API 요청 오류 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: url,
      baseUrl: JIRA_BASE_URL
    });
    throw new Error(`JIRA API 요청 실패: ${error.response?.status || error.message}`);
  }
}

// 1. 개별 이슈 조회 API
app.get('/api/issue/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    
    // 헤더에서 인증 정보 추출 (여러 방식 지원)
    const username = req.headers.username || req.headers['x-username'] || req.headers.Username;
    const password = req.headers.password || req.headers['x-password'] || req.headers.Password;

    console.log(`이슈 조회 요청: ${issueKey}`);
    console.log(`사용자명: ${username ? '제공됨' : '없음'}`);
    console.log(`비밀번호: ${password ? '제공됨' : '없음'}`);
    console.log('전체 헤더:', JSON.stringify(req.headers, null, 2));

    if (!username || !password) {
      console.log('인증 정보 누락');
      return res.status(401).json({ 
        error: '인증 정보가 필요합니다. username과 password를 헤더에 포함해주세요.',
        debug: {
          receivedHeaders: Object.keys(req.headers),
          usernameFound: !!username,
          passwordFound: !!password,
          allHeaders: req.headers
        }
      });
    }

    const authHeader = createAuthHeader(username, password);
    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;
    
    const issueData = await makeJiraRequest(url, authHeader);
    
    res.json({
      success: true,
      data: issueData
    });
  } catch (error) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 2. 여러 이슈 조회 API (JQL 사용)
app.post('/api/issues/search', async (req, res) => {
  try {
    const { issueKeys } = req.body;
    
    // 헤더에서 인증 정보 추출 (여러 방식 지원)
    const username = req.headers.username || req.headers['x-username'] || req.headers.Username;
    const password = req.headers.password || req.headers['x-password'] || req.headers.Password;

    console.log(`이슈 조회 요청: ${issueKeys}`);
    console.log(`사용자명: ${username ? '제공됨' : '없음'}`);
    console.log(`비밀번호: ${password ? '제공됨' : '없음'}`);
    console.log('전체 헤더:', JSON.stringify(req.headers, null, 2));

    if (!username || !password) {
      console.log('인증 정보 누락');
      return res.status(401).json({ 
        error: '인증 정보가 필요합니다. username과 password를 헤더에 포함해주세요.',
        debug: {
          receivedHeaders: Object.keys(req.headers),
          usernameFound: !!username,
          passwordFound: !!password,
          allHeaders: req.headers
        }
      });
    }

    if (!issueKeys || !Array.isArray(issueKeys) || issueKeys.length === 0) {
      return res.status(400).json({
        error: 'issueKeys 배열이 필요합니다.'
      });
    }

    const authHeader = createAuthHeader(username, password);
    const url = `${JIRA_BASE_URL}/rest/api/3/search/jql`
    const body = {
      "jql": `issueKey IN (${issueKeys.join(', ')})`,
      "fields": ["*all"],
      "maxResults": maxResults,
    }
    const searchData = await axios.post(url, body, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: searchData.data
    });
  } catch (error) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 3. Epic 이슈의 하위 이슈들 조회 API
app.get('/api/epic/:epicKey/issues', async (req, res) => {
  try {
    const { epicKey } = req.params;
    
    // 헤더에서 인증 정보 추출 (여러 방식 지원)
    const username = req.headers.username || req.headers['x-username'] || req.headers.Username;
    const password = req.headers.password || req.headers['x-password'] || req.headers.Password;

    console.log(`Epic 이슈 조회 요청: ${epicKey}`);
    console.log(`사용자명: ${username ? '제공됨' : '없음'}`);
    console.log(`비밀번호: ${password ? '제공됨' : '없음'}`);
    console.log('전체 헤더:', JSON.stringify(req.headers, null, 2));

    if (!username || !password) {
      console.log('인증 정보 누락');
      return res.status(401).json({ 
        error: '인증 정보가 필요합니다. username과 password를 헤더에 포함해주세요.',
        debug: {
          receivedHeaders: Object.keys(req.headers),
          usernameFound: !!username,
          passwordFound: !!password,
          allHeaders: req.headers
        }
      });
    }

    const authHeader = createAuthHeader(username, password);
    const url = `${JIRA_BASE_URL}/rest/agile/1.0/epic/${epicKey}/issue?maxResults=${maxResults}`;
    
    const epicIssues = await makeJiraRequest(url, authHeader);
    
    res.json({
      success: true,
      data: epicIssues
    });
  } catch (error) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 4. 인증 테스트 API
app.post('/api/auth/test', async (req, res) => {
  try {
    // 헤더에서 인증 정보 추출 (여러 방식 지원)
    const username = req.headers.username || req.headers['x-username'] || req.headers.Username;
    const password = req.headers.password || req.headers['x-password'] || req.headers.Password;

    console.log(`인증 테스트 요청`);
    console.log(`사용자명: ${username ? '제공됨' : '없음'}`);
    console.log(`비밀번호: ${password ? '제공됨' : '없음'}`);
    console.log('전체 헤더:', JSON.stringify(req.headers, null, 2));

    if (!username || !password) {
      console.log('인증 정보 누락');
      return res.status(401).json({ 
        error: '인증 정보가 필요합니다. username과 password를 헤더에 포함해주세요.',
        debug: {
          receivedHeaders: Object.keys(req.headers),
          usernameFound: !!username,
          passwordFound: !!password,
          allHeaders: req.headers
        }
      });
    }

    const authHeader = createAuthHeader(username, password);
    const url = `${JIRA_BASE_URL}/rest/api/3/myself`;
    
    const userData = await makeJiraRequest(url, authHeader);
    
    res.json({
      success: true,
      message: '인증이 성공했습니다.',
      user: {
        accountId: userData.accountId,
        displayName: userData.displayName,
        emailAddress: userData.emailAddress
      }
    });
  } catch (error) {
    console.error('API 에러:', error.message);
    console.error('에러 스택:', error.stack);
    res.status(401).json({
      success: false,
      error: '인증에 실패했습니다. username과 password를 확인해주세요.',
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 헬스 체크 API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JIRA API 서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 JIRA API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📋 API 문서: http://localhost:${PORT}/health`);
});

module.exports = app;
