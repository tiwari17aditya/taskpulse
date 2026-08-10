import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getNeonSql() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL is missing in .env configuration');
  }
  return neon(connectionString);
}

async function ensureNotesTableExists(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      "bgColor" TEXT,
      pinned BOOLEAN DEFAULT false,
      tags JSONB DEFAULT '[]'::jsonb,
      media JSONB DEFAULT '[]'::jsonb,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}

export async function GET() {
  try {
    const sql = getNeonSql();
    await ensureNotesTableExists(sql);
    const notes = await sql`SELECT * FROM notes ORDER BY "createdAt" DESC;`;
    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error('NeonDB notes GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql = getNeonSql();
    await ensureNotesTableExists(sql);

    const { id, title, content = '', bgColor = '', pinned = false, tags = [], media = [], createdAt } = body;

    await sql`
      INSERT INTO notes (id, title, content, "bgColor", pinned, tags, media, "createdAt")
      VALUES (
        ${id},
        ${title},
        ${content},
        ${bgColor},
        ${pinned},
        ${JSON.stringify(tags)},
        ${JSON.stringify(media)},
        ${createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
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
