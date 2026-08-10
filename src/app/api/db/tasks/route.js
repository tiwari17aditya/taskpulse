import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getNeonSql() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL is missing in .env configuration');
  }
  return neon(connectionString);
}

async function ensureTasksTableExists(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      "myDay" BOOLEAN DEFAULT false,
      starred BOOLEAN DEFAULT false,
      "dueDate" TEXT,
      subtasks JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      notes TEXT,
      media JSONB DEFAULT '[]'::jsonb,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}

export async function GET() {
  try {
    const sql = getNeonSql();
    await ensureTasksTableExists(sql);
    const tasks = await sql`SELECT * FROM tasks ORDER BY "createdAt" DESC;`;
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('NeonDB tasks GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql = getNeonSql();
    await ensureTasksTableExists(sql);

    const { id, title, completed = false, myDay = false, starred = false, dueDate = '', subtasks = [], tags = [], notes = '', media = [], createdAt } = body;

    const subtasksJson = typeof subtasks === 'string' ? subtasks : JSON.stringify(subtasks || []);
    const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
    const mediaJson = typeof media === 'string' ? media : JSON.stringify(media || []);

    await sql`
      INSERT INTO tasks (id, title, completed, "myDay", starred, "dueDate", subtasks, tags, notes, media, "createdAt")
      VALUES (
        ${id},
        ${title},
        ${completed},
        ${myDay},
        ${starred},
        ${dueDate},
        ${subtasksJson}::jsonb,
        ${tagsJson}::jsonb,
        ${notes},
        ${mediaJson}::jsonb,
        ${createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        completed = EXCLUDED.completed,
        "myDay" = EXCLUDED."myDay",
        starred = EXCLUDED.starred,
        "dueDate" = EXCLUDED."dueDate",
        subtasks = EXCLUDED.subtasks,
        tags = EXCLUDED.tags,
        notes = EXCLUDED.notes,
        media = EXCLUDED.media;
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('NeonDB tasks POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing task id' }, { status: 400 });

    const sql = getNeonSql();
    await ensureTasksTableExists(sql);
    await sql`DELETE FROM tasks WHERE id = ${id};`;
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('NeonDB tasks DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
