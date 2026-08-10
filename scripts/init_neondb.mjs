import { neon } from '@neondatabase/serverless';

const connectionString = "postgresql://neondb_owner:npg_XzL2dPsr4VTl@ep-proud-field-ay8ssmib-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  console.log('Connecting to NeonDB...');
  const sql = neon(connectionString);

  console.log('Creating tasks table...');
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

  console.log('Creating notes table...');
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

  console.log('Inserting initial demo records if empty...');
  await sql`
    INSERT INTO tasks (id, title, completed, "myDay", starred, "dueDate", subtasks, tags, notes, "createdAt")
    VALUES (
      't-welcome-1',
      'Welcome to TaskPulse - NeonDB PostgreSQL Connection Active!',
      false,
      true,
      true,
      'Today',
      '[{"id":"st-1","title":"Explore Microsoft To-Do & Keep Vault","completed":true}]'::jsonb,
      '["Work"]'::jsonb,
      'NeonDB table created automatically and connected.',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log('SUCCESS! Tasks and Notes tables created in NeonDB!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
