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

async function ensureNotesTableExists(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      "profileId" TEXT,
      title TEXT NOT NULL,
      content TEXT,
      "bgColor" TEXT,
      pinned BOOLEAN DEFAULT false,
      tags JSONB DEFAULT '[]'::jsonb,
      media JSONB DEFAULT '[]'::jsonb,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  try {
    await sql`ALTER TABLE notes ADD COLUMN IF NOT EXISTS "profileId" TEXT;`;
  } catch (e) {
    console.warn('Could not run ALTER TABLE notes:', e.message);
  }
}

export async function GET() {
  try {
    const sql = getNeonSql();
    await ensureNotesTableExists(sql);
    const notes = await sql`SELECT * FROM notes ORDER BY "createdAt" DESC;`;
    return NextResponse.json(
      { success: true, notes },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('NeonDB notes GET error:', error);
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
    await ensureNotesTableExists(sql);

    const { id, profileId = 'p-aditya', title, content = '', bgColor = '', pinned = false, tags = [], media = [], createdAt } = body;

    const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
    const mediaJson = typeof media === 'string' ? media : JSON.stringify(media || []);

    await sql`
      INSERT INTO notes (id, "profileId", title, content, "bgColor", pinned, tags, media, "createdAt")
      VALUES (
        ${id},
        ${profileId},
        ${title},
        ${content},
        ${bgColor},
        ${pinned},
        ${tagsJson}::jsonb,
        ${mediaJson}::jsonb,
        ${createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        "profileId" = EXCLUDED."profileId",
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        "bgColor" = EXCLUDED."bgColor",
        pinned = EXCLUDED.pinned,
        tags = EXCLUDED.tags,
        media = EXCLUDED.media;
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('NeonDB notes POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    const deleteAll = searchParams.get('all') === 'true';

    const sql = getNeonSql();
    await ensureNotesTableExists(sql);

    if (deleteAll) {
      await sql`TRUNCATE TABLE notes;`;
      return NextResponse.json({ success: true, mode: 'all' });
    }

    let body = null;
    try {
      body = await request.json();
    } catch (e) {}

    const idsToDelete = body?.ids || (idsParam ? idsParam.split(',').filter(Boolean) : (id ? [id] : []));
    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing note id or ids' }, { status: 400 });
    }

    for (const noteId of idsToDelete) {
      await sql`DELETE FROM notes WHERE id = ${noteId};`;
    }

    return NextResponse.json({ success: true, count: idsToDelete.length, ids: idsToDelete });
  } catch (error) {
    console.error('NeonDB notes DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
