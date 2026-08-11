# TaskPulse - Industrial-Grade Personal Daily & Planning Workspace

**TaskPulse** is an all-in-one personal daily planner and productivity engine. It merges the core strengths of **Microsoft To-Do** (task management, checklists, due dates, "My Day"), **Google Keep** (visual masonry card notes, colors, media attachments), **Apple Reminders** (smart filters, multi-tag system), and **Codeshare.io / Toffeeshare** (custom room passcodes, direct URL redirection).

---

## Architecture & Tech Stack Overview (100% Free-Tier)

- **Framework**: Next.js 14+ (App Router) + React 18/19.
- **Styling**: Tailwind CSS + Custom CSS Variables + Lucide React Icons + Glassmorphism Dark Theme.
- **Database & Storage**:
  - **NeonDB**: Serverless PostgreSQL (`@neondatabase/serverless`) with automatic table creation (`/api/db/tasks` & `/api/db/notes`).
  - **Supabase**: Primary cloud object storage & PostgreSQL.
  - **Universal Database Adapter (`src/lib/dbAdapter.js`)**: Dynamic provider switcher supporting `neondb`, `supabase`, `postgres`, and `local` fallback.
- **Hosting & Deployment**: Vercel (`vercel.json` preset configured).
- **Mobile & Cross-Platform Support**: 100% Mobile-Responsive with slide-over drawer navigation, mobile top header hamburger menu, touch-optimized popovers, and full-screen modal overlays.
- **Version Control**: Git & GitHub (`tiwari17aditya/taskpulse`).
- **Virtual Environment**: Isolated Python 3.12.10 virtual environment (`.venv`).

---

## Directory Architecture

```
d:\Antigravity-Projects\taskpulse/
├── .agents/                    # Workspace agent rules & modular domain skills
│   ├── AGENTS.md               # Token optimization & coding conventions
│   └── skills/                 # Domain skills (task-manager, keep-notes, share-redirect, ops-logging)
├── .venv/                      # Isolated Python virtual environment
├── logs/                       # Daily system logs (e.g. log_2026-08-10.log)
├── public/                     # Public assets & .gitkeep
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── db/tasks/       # NeonDB tasks API handler (GET / POST + auto-table migration)
│   │   │   ├── db/notes/       # NeonDB notes API handler (GET / POST + auto-table migration)
│   │   │   ├── logs/           # Daily system logger API
│   │   │   ├── share/          # Secret share code generator API
│   │   │   └── tokens/         # Daily token usage tracker API
│   │   ├── share/[code]/       # Codeshare & Toffeeshare redirect route
│   │   ├── globals.css         # Styling, dark mode, scrollbars
│   │   ├── layout.js           # Root layout & page metadata
│   │   └── page.js             # Main Workspace Dashboard
│   ├── components/
│   │   ├── Sidebar.js          # Navigation sidebar & History / Completed tab
│   │   ├── TaskManager.js      # Microsoft To-Do list, subtasks & date presets
│   │   ├── NoteCanvas.js       # Google Keep visual masonry cards & media
│   │   ├── MediaUploader.js    # Image, audio, video & document uploader
│   │   ├── ShareRedirectModal.js # Open-Source Sharing Utilities (Codeshare URL launcher + visited history, Toffeeshare direct link)
│   │   ├── TokenUsageModal.js  # token_usage.md tabular log viewer
│   │   ├── LogViewerModal.js   # Daily log inspector
│   │   └── UserGuideModal.js   # Interactive User Guide & Documentation modal
│   └── lib/
│       ├── dbAdapter.js        # Universal Database Switcher (NeonDB / Supabase / Local)
│       ├── logger.js           # File logger utility
│       ├── storage.js          # LocalStorage fallback manager
│       ├── supabaseClient.js   # Supabase SDK client
│       └── tokenTracker.js     # Token usage table appender
├── .env                        # Central active configuration file
├── .env.example                # Version-controlled configuration template
├── .gitignore                  # Git exclusion rules (.env, .venv, node_modules)
├── DOCUMENTATION.md            # Comprehensive project documentation
├── ENHANCEMENTS.md             # Feature roadmap (LDAP v2, WebRTC P2P, AI voice notes)
├── jsconfig.json               # Path alias configuration (@/* -> ./src/*)
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies
├── tailwind.config.js          # Custom colors & animations
├── token_usage.md              # Tabular daily token tracking log
├── vercel.json                 # Vercel Next.js framework preset configuration
└── VERSION.md                  # Version release tracking history
```

---

## Database Schemas & Auto-Migration

When `NEXT_PUBLIC_DB_PROVIDER=neondb` is set in `.env`, the serverless routes automatically execute the following SQL table creation schemas on first API access:

### `tasks` Table Schema:
```sql
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
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "completedAt" TEXT
);
```

### `notes` Table Schema:
```sql
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
```

---

## Real-Time Mobile DB Sync & Bulk Deletion System

### 1. Real-Time Multi-Device Synchronization
- **8-Second Background Polling**: `page.js` runs a background polling loop to automatically stream database updates across devices.
- **Tab Visibility & Focus Re-Sync**: Listeners on `visibilitychange`, `focus`, and `online` trigger instant re-fetch whenever switching back to the TaskPulse mobile tab.
- **Dynamic API Caching Bypass**: API routes `/api/db/tasks` and `/api/db/notes` use `export const dynamic = 'force-dynamic'` and `Cache-Control: no-store` to prevent Next.js static build caching.
- **Local Network Wi-Fi Binding**: `package.json` dev script configured to `next dev -H 0.0.0.0` so mobile devices on the same Wi-Fi network can connect to `http://<laptop-ip>:3000`.

### 2. Multi-Select & Bulk Deletion Mechanisms
- **Selection Mode**: Toggle **Multi-Select** in `TaskManager.js` or `NoteCanvas.js` to show item checkboxes.
- **Select All / Deselect All**: Select or deselect all filtered items with a single click.
- **Delete Selected (X)**: Batch delete selected item IDs via array POST/DELETE request.
- **Clear All Items**: One-click bulk delete for all items in the active view.

---

## How to Verify NeonDB Data

1. Log into your [Neon Console](https://console.neon.tech).
2. Select your project **`taskpulse`**.
3. Click **Tables** in the left sidebar menu to view `tasks` and `notes` rows.
4. Or open **SQL Editor** and run `SELECT * FROM tasks;`.

---

## Running Locally & Deploying

- **Local Dev Server (Local Network Access)**:
  ```bash
  cmd /c npm run dev
  ```
- **Build Verification**:
  ```bash
  cmd /c npm run build
  ```
- **Git Push**:
  ```bash
  cmd /c git push -u origin main
  ```

