import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'JIRA API 서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString(),
  });
}
