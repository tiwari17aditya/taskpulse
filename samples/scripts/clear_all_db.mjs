import { neon } from '@neondatabase/serverless';
import fs from 'fs';

let connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/NEON_DATABASE_URL=(.+)/);
  if (match) connectionString = match[1].trim();
}

if (!connectionString) {
  console.error('Missing NEON_DATABASE_URL');
  process.exit(1);
}

connectionString = connectionString.replace(/&channel_binding=[^&]+/g, '');

async function clearDB() {
  console.log('Connecting to NeonDB to clear all tasks and notes records...');
  const sql = neon(connectionString);

  await sql`TRUNCATE TABLE tasks;`;
  await sql`TRUNCATE TABLE notes;`;

  console.log('SUCCESS: All rows removed from tasks and notes tables in NeonDB!');
}

clearDB().catch(err => {
  console.error('Clear DB failed:', err);
  process.exit(1);
});
