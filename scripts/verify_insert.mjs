import { neon } from '@neondatabase/serverless';

// Clean connection string without channel_binding parameter
const connectionString = "postgresql://neondb_owner:npg_XzL2dPsr4VTl@ep-proud-field-ay8ssmib-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function verify() {
  console.log('Connecting to NeonDB with clean connection string...');
  const sql = neon(connectionString);

  console.log('Inserting row into tasks...');
  const result = await sql`
    INSERT INTO tasks (id, title, completed, "myDay", starred, "dueDate", subtasks, tags, notes, media, "createdAt")
    VALUES (
      't-verify-1',
      'Verify Live Task in Neon Console',
      false,
      true,
      true,
      'Today',
      '[]'::jsonb,
      '["Work"]'::jsonb,
      'Test persistence directly in NeonDB',
      '[]'::jsonb,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
    RETURNING *;
  `;

  console.log('INSERT RESULT FROM NEONDB:', JSON.stringify(result, null, 2));

  const allRows = await sql`SELECT * FROM tasks;`;
  console.log('TOTAL ROWS IN TASKS TABLE:', allRows.length);
  console.log('ALL ROWS:', JSON.stringify(allRows, null, 2));
}

verify().catch(err => {
  console.error('Verification failed:', err);
});
