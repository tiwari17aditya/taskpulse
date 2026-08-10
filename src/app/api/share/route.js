import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SHARES_FILE = path.join(process.cwd(), 'logs', 'shared_codes.json');

function getShares() {
  try {
    if (fs.existsSync(SHARES_FILE)) {
      const data = fs.readFileSync(SHARES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading shared codes:', e);
  }
  return {};
}

function saveShares(shares) {
  try {
    const dir = path.dirname(SHARES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SHARES_FILE, JSON.stringify(shares, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving shared codes:', e);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shares = getShares();

  if (code) {
    const item = shares[code.toUpperCase()] || shares[code.toLowerCase()];
    if (item) {
      return NextResponse.json({ success: true, item });
    }
    return NextResponse.json({ success: false, error: 'Share code not found or expired' }, { status: 404 });
  }

  return NextResponse.json({ success: true, shares });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, type = 'text', mediaUrl = null, redirectUrl = null, customCode = '', expiresHours = 24 } = body;
    
    // Generate code or use user custom passcode / room alias
    const rawCode = customCode && customCode.trim()
      ? customCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : Math.random().toString(36).substring(2, 8).toUpperCase();

    const code = rawCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const shares = getShares();

    const newShare = {
      code,
      title: title || 'Untitled Shared Note',
      content: content || '',
      type, // 'text', 'code', 'redirect', 'media'
      mediaUrl,
      redirectUrl,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresHours * 3600 * 1000).toISOString(),
    };

    shares[code.toUpperCase()] = newShare;
    shares[code.toLowerCase()] = newShare;
    saveShares(shares);

    return NextResponse.json({ success: true, share: newShare });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
