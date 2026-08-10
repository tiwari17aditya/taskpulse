import { NextResponse } from 'next/server';
import { readLog, writeLog } from '@/lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const logContent = readLog(date);
  return NextResponse.json({ date: date || new Date().toISOString().split('T')[0], content: logContent });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { level = 'info', message = '' } = body;
    writeLog(level, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
