# JIRA API 조회 서버

Node.js와 Express를 사용한 JIRA API 조회 서버입니다.

## 기능

- 개별 이슈 조회
- 여러 이슈 일괄 조회 (JQL 사용)
- Epic 이슈의 하위 이슈들 조회
- Basic Auth 인증 지원

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드로 실행
npm run dev

# 프로덕션 모드로 실행
npm start
```

## 환경 설정

1. `.env.example` 파일을 `.env`로 복사
2. 필요한 경우 JIRA_BASE_URL 수정

## API 엔드포인트

### 1. 개별 이슈 조회
```
GET /api/issue/:issueKey
```

**헤더:**
- `username`: JIRA 사용자명
- `password`: JIRA API 토큰 또는 비밀번호

**예시:**
```bash
curl -X GET "http://localhost:3000/api/issue/OHNG-1016" \
  -H "username: your-username" \
  -H "password: your-api-token"
```

### 2. 여러 이슈 조회
```
POST /api/issues/search
```

**헤더:**
- `username`: JIRA 사용자명
- `password`: JIRA API 토큰 또는 비밀번호

**Body:**
```json
{
  "issueKeys": ["OHNG-1020", "OHNG-1021"]
}
```

**예시:**
```bash
curl -X POST "http://localhost:3000/api/issues/search" \
  -H "Content-Type: application/json" \
  -H "username: your-username" \
  -H "password: your-api-token" \
  -d '{"issueKeys": ["OHNG-1020", "OHNG-1021"]}'
```

### 3. Epic 이슈의 하위 이슈들 조회
```
GET /api/epic/:epicKey/issues
```

**헤더:**
- `username`: JIRA 사용자명
- `password`: JIRA API 토큰 또는 비밀번호

**예시:**
```bash
curl -X GET "http://localhost:3000/api/epic/OHNG-1016/issues" \
  -H "username: your-username" \
  -H "password: your-api-token"
```

### 4. 인증 테스트
```
POST /api/auth/test
```

**헤더:**
- `username`: JIRA 사용자명
- `password`: JIRA API 토큰 또는 비밀번호

### 5. 헬스 체크
```
GET /health
```

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... }
}
```

### 오류 응답
```json
{
  "success": false,
  "error": "오류 메시지"
}
```

## 보안 주의사항

- JIRA API 토큰을 사용하는 것을 권장합니다
- 프로덕션 환경에서는 HTTPS를 사용하세요
- 인증 정보를 로그에 남기지 않도록 주의하세요

## 개발

- `nodemon`을 사용하여 개발 중 자동 재시작
- CORS가 활성화되어 있어 프론트엔드에서 직접 호출 가능
