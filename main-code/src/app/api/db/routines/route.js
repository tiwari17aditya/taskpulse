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

async function ensureRoutinesTableExists(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      "profileId" TEXT,
      title TEXT NOT NULL,
      notes TEXT,
      frequency TEXT,
      "targetTime" TEXT,
      "selectedDays" JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      "autoMyDay" BOOLEAN DEFAULT true,
      logs JSONB DEFAULT '[]'::jsonb,
      streak INTEGER DEFAULT 0,
      paused BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}

export async function GET() {
  try {
    const sql = getNeonSql();
    await ensureRoutinesTableExists(sql);
    const routines = await sql`SELECT * FROM routines ORDER BY "createdAt" DESC;`;
    return NextResponse.json(
      { success: true, routines },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('NeonDB routines GET error:', error);
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
    await ensureRoutinesTableExists(sql);

    const items = Array.isArray(body) ? body : [body];

    for (const r of items) {
      const {
        id,
        profileId = 'p-aditya',
        title,
        notes = '',
        frequency = 'daily',
        targetTime = '08:00',
        selectedDays = [0, 1, 2, 3, 4, 5, 6],
        tags = [],
        autoMyDay = true,
        logs = [],
        streak = 0,
        paused = false,
        createdAt
      } = r;

      const selectedDaysJson = typeof selectedDays === 'string' ? selectedDays : JSON.stringify(selectedDays || []);
      const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
      const logsJson = typeof logs === 'string' ? logs : JSON.stringify(logs || []);

      await sql`
        INSERT INTO routines (
          id, "profileId", title, notes, frequency, "targetTime",
          "selectedDays", tags, "autoMyDay", logs, streak, paused, "createdAt"
        )
        VALUES (
          ${id},
          ${profileId},
          ${title},
          ${notes},
          ${frequency},
          ${targetTime},
          ${selectedDaysJson}::jsonb,
          ${tagsJson}::jsonb,
          ${autoMyDay},
          ${logsJson}::jsonb,
          ${streak},
          ${paused},
          ${createdAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          "profileId" = EXCLUDED."profileId",
          title = EXCLUDED.title,
          notes = EXCLUDED.notes,
          frequency = EXCLUDED.frequency,
          "targetTime" = EXCLUDED."targetTime",
          "selectedDays" = EXCLUDED."selectedDays",
          tags = EXCLUDED.tags,
          "autoMyDay" = EXCLUDED."autoMyDay",
          logs = EXCLUDED.logs,
          streak = EXCLUDED.streak,
          paused = EXCLUDED.paused;
      `;
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error('NeonDB routines POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sql = getNeonSql();
    await ensureRoutinesTableExists(sql);

    if (id) {
      await sql`DELETE FROM routines WHERE id = ${id};`;
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ success: false, error: 'Missing routine id' }, { status: 400 });
  } catch (error) {
    console.error('NeonDB routines DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
