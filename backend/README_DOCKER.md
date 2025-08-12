# Backend Docker 실행 가이드

이 문서는 Node.js Express 기반 JIRA API 서버를 Docker로 쉽게 실행하기 위한 가이드입니다.

## 사전 준비
- Docker Desktop 설치 (Windows/Mac)
- 프로젝트 루트에 환경변수 파일(.env) 준비
  - 변수 목록은 `.env.example`를 참고하여 `.env`를 생성하세요.

## 1) 이미지 빌드
프로젝트의 `backend` 디렉터리에서 다음 명령을 실행합니다.

```bash
# backend 디렉터리에서 실행
docker build -t jira-report-backend:latest .
```

## 2) 컨테이너 실행 (docker run)
환경변수는 `.env` 파일로 주입하는 것을 권장합니다.

```bash
# Windows PowerShell 예시 (backend 디렉터리에서)
docker run --name jira-report-backend \
  -p 3000:3000 \
  jira-report-backend:latest
```

- 서버가 컨테이너 내부에서 3000 포트로 동작하며, 호스트의 3000 포트로 매핑됩니다.
- 기본 진입점은 `node server.js`입니다.

## 3) 환경변수
- 필요한 키는 `.env.example`를 참고하세요.
- 일반적으로 아래와 같은 항목이 필요합니다(예: JIRA 접속 정보 등).
  - JIRA URL (예: https://jsdev.atlassian.net)
  - JIRA 사용자 이메일
  - JIRA API 토큰
- 민감한 값은 절대 깃에 커밋하지 말고 `.env`로만 관리하세요.

## 4) 로그 확인/종료
```bash
# 로그 보기
docker logs -f jira-report-backend

# 컨테이너 종료 (실행 터미널에서 Ctrl+C 또는 별도 쉘에서)
docker stop jira-report-backend
```

## 5) 개발 편의: 소스 코드 볼륨 마운트(옵션)
개발 중 코드 변경을 즉시 반영하고 싶다면 로컬 소스를 컨테이너에 마운트할 수 있습니다.

```bash
# Node_modules는 컨테이너 내 의존성을 사용하기 위해 제외 권장
docker run --name jira-report-backend-dev \
  --rm -p 3000:3000 \
  --env-file ./.env \
  -v ${PWD}:/app \
  -v /app/node_modules \
  jira-report-backend:latest
```

참고: Windows PowerShell에서 `${PWD}`가 동작하지 않으면 절대경로를 사용하세요. 예) `-v C:\\Users\\wjdql\\WebstormProjects\\jira-report\\backend:/app`

## 6) 자주 사용하는 변형 옵션
- 다른 포트로 노출: `-p 8080:3000`
- 백그라운드(detached) 모드: `-d`

예)
```bash
docker run -d --name jira-report-backend -p 8080:3000 --env-file ./.env jira-report-backend:latest
```

## 문제 해결
- 500/404 등 오류가 발생하면 먼저 `.env`의 JIRA URL/이슈키/권한을 확인하세요.
- 로컬에서는 Postman으로 정상인데 컨테이너에서만 실패한다면 환경변수 주입 여부(`--env-file`)와 값 차이를 점검하세요.
