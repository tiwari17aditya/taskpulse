import { neon } from '@neondatabase/serverless';

const connectionString = "postgresql://neondb_owner:npg_XzL2dPsr4VTl@ep-proud-field-ay8ssmib-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function seed() {
  console.log('Connecting to NeonDB for tasks & notes seeding...');
  const sql = neon(connectionString);

  const initialTasks = [
    {
      id: 'task-101',
      title: 'Complete TaskPulse workspace setup & GitHub push',
      completed: true,
      myDay: true,
      starred: true,
      dueDate: 'Today',
      subtasks: JSON.stringify([
        { id: 'st-1', title: 'Setup Next.js 14 App Router codebase', completed: true },
        { id: 'st-2', title: 'Initialize Git repository and push to GitHub', completed: true }
      ]),
      tags: JSON.stringify(['Work', 'Dev']),
      notes: 'Initial workspace repository initialized.',
      media: JSON.stringify([]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-102',
      title: 'Configure NeonDB PostgreSQL database sync & tables',
      completed: true,
      myDay: true,
      starred: true,
      dueDate: 'Today',
      subtasks: JSON.stringify([
        { id: 'st-3', title: 'Install @neondatabase/serverless', completed: true },
        { id: 'st-4', title: 'Create auto-migration routes /api/db/tasks and /api/db/notes', completed: true }
      ]),
      tags: JSON.stringify(['Work', 'Database']),
      notes: 'NeonDB tables created successfully in public schema.',
      media: JSON.stringify([]),
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'task-103',
      title: 'Explore Microsoft To-Do, Keep Vault & User Guide',
      completed: false,
      myDay: true,
      starred: false,
      dueDate: 'Today',
      subtasks: JSON.stringify([
        { id: 'st-5', title: 'Test My Day focus list & date presets', completed: false },
        { id: 'st-6', title: 'Test custom Codeshare.io room passcodes', completed: false },
        { id: 'st-7', title: 'Open User Guide modal in sidebar', completed: false }
      ]),
      tags: JSON.stringify(['Personal', 'Feature']),
      notes: 'All features verified and working.',
      media: JSON.stringify([]),
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'task-104',
      title: 'Test Codeshare.io custom room passcode redirection',
      completed: false,
      myDay: false,
      starred: true,
      dueDate: 'Tomorrow',
      subtasks: JSON.stringify([]),
      tags: JSON.stringify(['Share']),
      notes: 'Generate codeshare.io/aditya-room-123 custom link.',
      media: JSON.stringify([]),
      createdAt: new Date(Date.now() - 900000).toISOString()
    }
  ];

  const initialNotes = [
    {
      id: 'note-101',
      title: 'TaskPulse Architecture & Technology Stack',
      content: 'Built using Next.js 14 App Router, Tailwind CSS, NeonDB Serverless PostgreSQL, Supabase, and Vercel hosting.',
      bgColor: '#1e1b4b',
      pinned: true,
      tags: JSON.stringify(['TechStack', 'Docs']),
      media: JSON.stringify([]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'note-102',
      title: 'NeonDB PostgreSQL Credentials Reference',
      content: 'Database: neondb | Owner: neondb_owner | Pooler Endpoint: ep-proud-field-ay8ssmib-pooler',
      bgColor: '#064e3b',
      pinned: true,
      tags: JSON.stringify(['Database']),
      media: JSON.stringify([]),
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  console.log('Seeding tasks into NeonDB...');
  for (const t of initialTasks) {
    await sql`
      INSERT INTO tasks (id, title, completed, "myDay", starred, "dueDate", subtasks, tags, notes, media, "createdAt")
      VALUES (${t.id}, ${t.title}, ${t.completed}, ${t.myDay}, ${t.starred}, ${t.dueDate}, ${t.subtasks}::jsonb, ${t.tags}::jsonb, ${t.notes}, ${t.media}::jsonb, ${t.createdAt})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        completed = EXCLUDED.completed,
        "myDay" = EXCLUDED."myDay",
        starred = EXCLUDED.starred,
        "dueDate" = EXCLUDED."dueDate",
        subtasks = EXCLUDED.subtasks,
        tags = EXCLUDED.tags,
        notes = EXCLUDED.notes;
    `;
  }

  console.log('Seeding notes into NeonDB...');
  for (const n of initialNotes) {
    await sql`
      INSERT INTO notes (id, title, content, "bgColor", pinned, tags, media, "createdAt")
      VALUES (${n.id}, ${n.title}, ${n.content}, ${n.bgColor}, ${n.pinned}, ${n.tags}::jsonb, ${n.media}::jsonb, ${n.createdAt})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        "bgColor" = EXCLUDED."bgColor",
        pinned = EXCLUDED.pinned,
        tags = EXCLUDED.tags;
    `;
  }

  console.log('SUCCESS! All current tasks and notes seeded into NeonDB database!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
