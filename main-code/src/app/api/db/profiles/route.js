import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getNeonSql() {
  const connectionString = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '').replace(/&channel_binding=[^&]+/g, '');
  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL is missing in .env configuration');
  }
  return neon(connectionString);
}

async function ensureProfilesTableExists(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      color TEXT,
      avatar TEXT,
      role TEXT,
      pin TEXT DEFAULT '1234',
      "isLocked" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '1234';`;
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;`;
}

export async function GET() {
  try {
    const sql = getNeonSql();
    await ensureProfilesTableExists(sql);
    const profiles = await sql`SELECT * FROM profiles ORDER BY name ASC;`;
    return NextResponse.json(
      { success: true, profiles },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('NeonDB profiles GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql = getNeonSql();
    await ensureProfilesTableExists(sql);

    // Accept either array of profiles or single profile
    const profilesToSave = Array.isArray(body) ? body : (body.profiles ? body.profiles : [body]);

    for (const p of profilesToSave) {
      const { id, name, email = '', phone = '', color = '#6366f1', avatar = '👤', role = 'Member', pin = '1234', isLocked = false, createdAt } = p;
      if (!id || !name) continue;

      await sql`
        INSERT INTO profiles (id, name, email, phone, color, avatar, role, pin, "isLocked", "createdAt")
        VALUES (
          ${id},
          ${name},
          ${email},
          ${phone},
          ${color},
          ${avatar},
          ${role},
          ${pin},
          ${isLocked},
          ${createdAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          color = EXCLUDED.color,
          avatar = EXCLUDED.avatar,
          role = EXCLUDED.role,
          pin = EXCLUDED.pin,
          "isLocked" = EXCLUDED."isLocked";
      `;
    }

    return NextResponse.json({ success: true, count: profilesToSave.length });
  } catch (error) {
    console.error('NeonDB profiles POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let body = null;
    try {
      body = await request.json();
    } catch (e) {}

    const idsToDelete = body?.ids || (id ? [id] : []);
    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing profile id' }, { status: 400 });
    }

    const sql = getNeonSql();
    await ensureProfilesTableExists(sql);

    for (const profileId of idsToDelete) {
      await sql`DELETE FROM profiles WHERE id = ${profileId};`;
    }

    return NextResponse.json({ success: true, count: idsToDelete.length });
  } catch (error) {
    console.error('NeonDB profiles DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
