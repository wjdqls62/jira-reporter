# JIRA Reporter - Next.js 통합 버전

JIRA 이슈를 조회하고 리포트를 생성하는 웹 애플리케이션입니다. 기존 Backend(Express) + Frontend(React+Vite) 구조를 Next.js로 통합한 버전입니다.

## 주요 기능

- JIRA API를 통한 Epic/Issue 조회
- 결함 및 개선사항 분석
- 차트 및 통계 시각화
- JSON 데이터 다운로드
- 재발생 이슈 추적

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Material-UI (MUI), TailwindCSS
- **Data Fetching**: SWR, Axios
- **Charts**: Recharts
- **Form**: React Hook Form
- **Notifications**: Notistack

## 환경 설정

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# JIRA 설정
JIRA_BASE_URL=https://your-domain.atlassian.net

# Next.js 공개 환경 변수 (선택사항)
# NEXT_PUBLIC_API_BASE_URL=/api
```

**환경 변수 설명:**
- `JIRA_BASE_URL`: JIRA 인스턴스의 기본 URL (필수)
- `NEXT_PUBLIC_API_BASE_URL`: API 엔드포인트 기본 경로 (기본값: `/api`)

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
nextjs-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (백엔드)
│   │   ├── auth/test/           # 인증 테스트
│   │   ├── epic/[epicKey]/      # Epic 이슈 조회
│   │   ├── issue/[issueKey]/    # 개별 이슈 조회
│   │   ├── issues/search/       # 다중 이슈 검색
│   │   └── health/              # 헬스 체크
│   ├── report/                   # 리포트 페이지
│   │   ├── [issueType]/         # 동적 라우트
│   │   └── layout.tsx
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈 페이지
├── components/                   # React 컴포넌트
│   └── container/
│       ├── components/           # UI 컴포넌트
│       ├── hooks/                # Custom Hooks
│       ├── layout/               # 레이아웃 컴포넌트
│       └── pages/                # 페이지 컴포넌트
├── lib/                          # 유틸리티 및 라이브러리
│   ├── api/                      # API 관련
│   ├── constants/                # 상수
│   ├── validation/               # 검증 로직
│   ├── apiClient.ts              # API 클라이언트
│   └── jira.ts                   # JIRA API 유틸리티
└── public/                       # 정적 파일
```

## API 엔드포인트

### 인증
- `POST /api/auth/test` - JIRA 인증 테스트

### 이슈 조회
- `GET /api/issue/[issueKey]` - 개별 이슈 조회
- `POST /api/issues/search` - 다중 이슈 검색 (JQL)
- `GET /api/epic/[epicKey]/issues` - Epic의 하위 이슈 조회

### 헬스 체크
- `GET /api/health` - 서버 상태 확인

**인증 헤더:**
모든 API 요청에는 다음 헤더가 필요합니다:
- `username`: JIRA 이메일
- `password`: JIRA API Token

## 사용 방법

### 1. JIRA API Token 발급

1. JIRA 계정 설정으로 이동
2. Security → API Tokens
3. "Create API Token" 클릭
4. 생성된 토큰 복사

### 2. 애플리케이션 사용

1. 애플리케이션 접속
2. 이메일과 API Token 입력
3. Epic Key 또는 Issue Keys 입력
4. 리포트 타입 선택 (Epic / Issues)
5. 확인 이슈 Key 입력 (선택사항)
6. "조회" 버튼 클릭

### 3. 리포트 확인

- **테스트 요약**: 전체 이슈 통계
- **주요 결함 내역**: 결함 이슈 목록
- **주요 개선 내역**: 개선/새 기능 목록
- **재발생 이슈**: 재발생한 이슈 추적
- **차트**: 결함 원인별 분석, 수정률 등

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm start
```

### Docker 배포 (선택사항)

```dockerfile
FROM node:20-alpine AS base

# 의존성 설치
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 실행
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## 마이그레이션 정보

### 기존 구조 → Next.js 통합

**변경 사항:**
- Express.js 백엔드 → Next.js API Routes
- React Router → Next.js App Router
- Vite → Next.js 빌드 시스템
- 별도 서버 → 단일 Next.js 서버

**장점:**
- 단일 프로젝트로 관리 간소화
- 배포 프로세스 단순화
- SSR/SSG 지원 (필요시)
- 통합된 라우팅 시스템
- 개발 환경 설정 간소화

## 문제 해결

### CORS 에러
Next.js API Routes는 동일 도메인에서 실행되므로 CORS 문제가 발생하지 않습니다.

### 환경 변수가 적용되지 않음
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 서버를 재시작했는지 확인
- `NEXT_PUBLIC_` 접두사는 클라이언트에서만 접근 가능

### 빌드 에러
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

## 라이선스

ISC

## 기여

이슈 및 PR은 언제든 환영합니다!
