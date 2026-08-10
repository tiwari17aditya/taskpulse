import { NextResponse } from 'next/server';
import { readTokenUsage, appendTokenUsage } from '@/lib/tokenTracker';

export async function GET() {
  const content = readTokenUsage();
  return NextResponse.json({ content });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const success = appendTokenUsage(body);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
