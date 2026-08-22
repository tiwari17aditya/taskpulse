# TaskPulse - Industrial-Grade Personal Daily & Planning Workspace

**TaskPulse** is an all-in-one personal daily planner and productivity engine. It merges the core strengths of **Microsoft To-Do** (task management, checklists, due dates, "My Day"), **Google Keep** (visual masonry card notes, colors, media attachments), **Apple Reminders** (smart filters, multi-tag system), and **Codeshare.io / Toffeeshare** (custom room passcodes, direct URL redirection).

📖 **Technical Reference**: For an in-depth breakdown of all libraries, infrastructure layers, alternatives, pros/cons, and Mermaid architecture diagrams, see the [TaskPulse Tech Stack & Architecture Compendium](file:///d:/Antigravity-Projects/taskpulse/docs/TECH_STACK.md).

---

## 🚀 Key v1.3.4-beta Priority Enhancements

1. **SMS & Mobile Notifications Engine**:
   - Built `/api/notifications/sms` serverless endpoint with international country calling code selector (`COUNTRY_CODES` dataset), dynamic real-time mobile number validation, and support for Twilio carrier dispatch & high-fidelity simulation.
2. **Master Scheduling Enable/Disable Switches**:
   - Added independent scheduling enable/disable power toggles for both Email and SMS channels in `NotificationManagerModal.js`. When disabled, automated scheduling and dispatches are cleanly gated with informative status warnings.
3. **Profile Phone Number Database Synchronization**:
   - Added `phone` column to PostgreSQL `profiles` table schema in NeonDB, automatically syncing the user's validated mobile number across sessions and profiles.
4. **Multi-Criteria Task Sorting in Filter Bar**:
   - Added dynamic sorting in `TaskManager.js` by Task Name (A-Z, Z-A), Due Date (Earliest, Latest), and Priority (Starred First ⭐).
5. **Automated Due-Date & Priority Email Dispatch Engine**:
   - Built automatic action item scanner in `NotificationManagerModal.js` that dispatches scheduled task summaries directly to the recipient.
6. **Open Source Productivity Utilities Suite**:
   - Expanded `ShareRedirectModal.js` with direct integrations for Excalidraw, CryptPad, CyberChef, and Draw.io alongside Codeshare and Toffeeshare.
7. **Routine Card Layout Stabilization & Universal Crash Guard**:
   - Added safe icon import guards and locked routine card grid dimensions (`min-h-[230px]`, `line-clamp-2`) in `RoutineManager.js`.

---

## 🚀 Key v1.3.3-beta Priority Enhancements

1. **SMTP Mailing Resiliency & Multi-Directory Resolver**:
   - Upgraded `/api/notifications/email` route with resilient fallback `.env` file resolution across workspace directories.
   - Synchronized workspace root environment variables to eliminate missing SMTP credentials alerts when running from root.
2. **Dynamic SMTP Diagnostic Health Check & UI Status Pill**:
   - Added GET diagnostic endpoint on `/api/notifications/email` returning live server configuration status.
   - Integrated dynamic `SMTP Active` badge inside `NotificationManagerModal.js`.
3. **Interactive Inline Email Recipient Customization**:
   - Added editable recipient email address bar in the *Email & Mobile Dispatch* tab for one-click target confirmation.
4. **Vercel Automation Suite & `/manage-vercel` Slash Command**:
   - Built custom `/manage-vercel` command and skill for zero-effort batch environment variable synchronization (15 keys pushed automatically to Vercel).
   - Deployed live production build to [https://taskpulse17.vercel.app](https://taskpulse17.vercel.app) with 0 errors.

---

## 🚀 Key v1.3.2-beta Priority Enhancements

1. **Routine Tag Filtering & Interactive Tag Badges**:
   - Integrated a dedicated Routine Tag Filter toolbar in `RoutineManager.js` displaying all tags present on active routines with count badges.
   - Clicking any tag badge on a routine card or in the toolbar filters routines to show only tasks/habits associated with that tag.
   - Clicking "All Routines" or deselecting the tag restores visibility of all scheduled routines.
2. **Universal Note Editing at Any Point in Time**:
   - Any note in `NoteCanvas.js` can be edited at any time by clicking the note card or the dedicated Edit pencil icon.
   - Opens an Edit Note Modal to update title, body content, background color theme, tags, and media attachments with immediate database persistence (`saveNoteToDB`).
3. **Scheduled-Time Auto-Population for Routine Tasks in "My Day"**:
   - Routine tasks now strictly auto-populate into "My Day" only when their scheduled target time (`targetTime`) has arrived for today.
   - Once checked off or completed in My Day, routine tasks remain marked as completed for that day and never re-populate as uncompleted duplicate tasks on background DB polling.
4. **Database Tag Confirmation & Contextual Tag Scoping**:
   - Confirmed full structured persistence of `tags` as JSONB arrays across PostgreSQL (`tasks`, `notes`, `routines` tables) and LocalStorage.
   - Contextualized tag headers in `Sidebar.js` (`Tasks Tags`, `Note Tags`, `Routine Tags`) to keep domain workflows clearly separated.

---

## 🚀 Key v1.3.1-beta Priority Enhancements

1. **Planned vs. History Calendar View Synchronization**:
   - **Planned Calendar**: Displays forward-looking scheduled tasks by `dueDate`.
   - **History Calendar**: Displays retrospective accomplishments by `completedAt`.
2. **Integrated Day & Interval Agenda Breakdown**:
   - Selecting any date or date interval (Selected Day, Today, Next 7 Days, Last 7 Days, This Month, Custom From/To) renders active due tasks and completed tasks in an agenda panel directly under the calendar.
3. **Instant Bidirectional Reactivity**:
   - Checking an item immediately applies strike-through styles, triggers celebration confetti, persists to PostgreSQL/LocalStorage, and instantly recalculates calendar numeric count badges (`● Due` ↔ `✓ Done`).
   - Unchecking an item immediately restores it to active pending status and recalibrates calendar counts in real time.
4. **Inline Quick Task Addition for Calendar Dates**:
   - Rapid inline `+ Add task for [Selected Date]` creation form embedded in the day agenda header.
5. **Modular Component Architecture (`TaskCard.js`)**:
   - Isolated `TaskCard.js` under `src/components/task-manager/TaskCard.js` for clean code reuse across list and calendar views.

---

## 🚀 Key v1.2.0-beta Priority Enhancements

1. **Tag Management for Members & Admins**:
   - Members and admins can create, rename/edit, and delete workspace tags at any point in time.
   - Hovering over any tag row in `Sidebar.js` reveals inline **Edit (pencil)** and **Delete (trash)** controls.
2. **Numeric Item Counts in Calendar View**:
   - Replaced dot badges (`.`) on calendar date cells in `HistoryCalendar` with clear numeric item count badges:
     - `X●`: Active due tasks count.
     - `X✓`: Completed tasks count.
     - `X🔁`: Routine habit completions count.
     - `X🔔`: Scheduled reminders count.
3. **Separate Routine Tasks Calendar View**:
   - `HistoryCalendar` includes a 3-way view toggle: `[ All Items | 📋 Tasks Calendar | 🔁 Routine Calendar ]`.
   - Routine Calendar mode tracks daily habit execution logs (`routine.logs`) independently.
4. **Separated "My Day" Routine Tasks View**:
   - **My Day** (`my-day`) focus view divides active tasks into two distinct visual sections:
     - `☀️ Regular Focus Tasks`
     - `🔁 Routine Tasks & Daily Habits`
5. **Flexible Date Filter (Calendar Picker + Manual Placeholder Input)**:
   - Upgraded top "Filter by Date" toolbar in `TaskManager.js` with dual input support:
     - Select dates visually via the standard calendar picker.
     - Type dates manually into the text field (e.g., `YYYY-MM-DD`) for instant date filtering.
6. **Strict Current-Day "My Day" Eviction Logic**:
   - Enforces midnight / current day auto-cleanup: incomplete tasks from previous days are automatically evicted from My Day (`myDay: false`) so My Day stays strictly aligned with today.
7. **Streamlined Email Service & Recipient Prompting**:
   - Comments out non-email channels for current release scope to focus exclusively on Email Notifications.
   - Prompts user to configure and save recipient email address.
   - Blocks email dispatch and displays alert (`"Please provide a valid recipient address to continue"`) if recipient address is missing or invalid.
8. **Formatted Tabular Email Preview & Template with Proverb/Quote**:
   - Provides interactive **Preview Default Mail Template** modal rendering dark-mode styled HTML task tables and an inspiring quote/proverb banner (`Mark Twain & Tim Ferriss`).
   - Dispatches formatted HTML emails via Nodemailer SMTP endpoint (`/api/notifications/email`).

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
taskpulse/
├── src/                        # Application Core (Frontend UI + Backend API)
│   ├── app/                    # Next.js App Router (Pages & Backend Serverless API Routes)
│   │   ├── api/                # Backend Serverless Endpoints (db/tasks, db/notes, db/profiles, notifications)
│   │   ├── share/[code]/       # Codeshare secret share code redirect route
│   │   ├── globals.css         # Styling, dark mode, scrollbars
│   │   ├── layout.js           # Root layout & page metadata
│   │   └── page.js             # Main Workspace Dashboard
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

## ⚡ TaskPulse Workspace Slash Commands

TaskPulse supports autonomous slash commands for rapid developer workflows. You can type any command in the AI assistant prompt, or type `/commands` to get the list:

| Command | Category | Description |
| :--- | :--- | :--- |
| `/commands` | Help | Displays the full catalog of available slash commands and descriptions. |
| `/check-data-flow` | Integrity | Validates end-to-end data pipeline from UI state (tasks, subtasks, notes, routines, tags, media) through API routes (`/api/db/tasks`, `/api/db/notes`) to structured database tables (NeonDB/Supabase/Local). |
| `/packup` | Session | Automates git commit & push to GitHub `main`, updates logs, token metrics, version history, and generates a session closing report. |
| `/test-db` | Database | Tests connectivity, latency, and schema health for the active DB provider in `.env`. |
| `/switch-db [provider]` | Config | Switches `NEXT_PUBLIC_DB_PROVIDER` (`neondb`, `supabase`, `local`) and verifies adapter integration. |
| `/test-email` | SMTP | Sends a formatted test email with task table and quote banner via `/api/notifications/email`. |
| `/sync-docs` | Docs | Synchronizes `docs/DOCUMENTATION.md`, `UserGuideModal.js`, and `audits/VERSION.md`. |
| `/build-check` | Pre-flight | Runs Next.js build verification to guarantee zero production/SSR errors. |
| `/clean-logs` | Maintenance | Prunes stale logs in `audits/logs/` and calculates token rollups. |
| `/add-tag-feature` | Scaffolding | Ensures tag additions and filters stay synchronized across TaskManager, Sidebar, and KeepNotes. |
| `/audit-tokens` | Metrics | Logs token usage to `audits/token_usage.md`. |
| `/bump-version [version]` | Release | Updates version tags across `package.json`, documentation, and UI badges. |
| `/verify-routes` | Routing | Validates dynamic sharing routes (`/share/[code]`) and REST endpoints. |
| `/schedule-health` | Monitoring | Creates a background cron timer for autonomous periodic diagnostics. |

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

### `profiles` Table Schema:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  color TEXT,
  avatar TEXT,
  role TEXT,
  pin TEXT DEFAULT '1234',
  "isLocked" BOOLEAN DEFAULT false,
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

## Enterprise RBAC & Security System (v1.1.0-beta)

### 1. Role-Based Access Control (`src/config/rbac.json`)
- **Roles**: `User` (Standard workspace access to Tasks, Keep Notes, and Routines) vs `Admin` (System Control Panel, Database Sync Status, Version Audits, System Logs, and RBAC Management).
- **Default Role**: Standard users are assigned `User` role by default upon creation.
- **Admin Panel Delegation**: Admins can create new member profiles and promote or demote members inside the **Admin Control Panel** (accessible via the top header Admin button for logged-in Admins).

### 2. LDAP-Style Profile Privacy Locking (`ProfileLockModal.js`)
- **Profile Lock Screen**: Users can lock their active workspace using a 4-digit PIN/Password.
- **Shared Master Admin Password**: All Admin role profiles share the **SAME Master Admin Password** (default: `1234`). Updating the Master Admin PIN from any Admin profile (`test1`, `test2`, etc.) instantly updates it globally for ALL Admin accounts.
- **Forgot PIN & Reset**: Includes 1-click PIN reset options to restore lock PINs to default (`1234`). Admins can also reset any member's PIN from the Admin Panel.

### 3. Exclusive Floating Action Button (`+`) Task Modal
- **Single Entry Point**: All task creation forms have been consolidated into a single, prominent **Floating Action Button (`+`)** at the bottom-right corner (`w-16 h-16`).
- **Full Card Task Modal**: Clicking `+` opens a spacious whole-card modal overlay featuring task title, interactive month calendar date picker, editable date field, tags, notes, subtasks, and default `myDay: false`.

### 4. First-Time Visitor Onboarding Tutorial (`FirstTimeTutorialModal.js`)
- **Auto-Trigger**: Automatically triggers for first-time visitors (`localStorage` check) to guide users through task creation, workspace navigation, profile lock security, and explicitly directs users to the **User Guide / Manual** (`BookOpen` icon) button in the header.

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


