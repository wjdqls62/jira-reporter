# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 필수 파일만 먼저 복사해서 캐시 활용
COPY package*.json ./

# production 의존성만 설치 (npm v9+)
RUN npm ci --omit=dev

# 소스 복사
COPY . .

# 환경 설정
ENV NODE_ENV=production \
    PORT=3000

# 컨테이너에서 열어줄 포트
EXPOSE 3000

# 실행
CMD ["node", "server.js"]
