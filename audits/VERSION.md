# Version History

## [v1.3.4-beta] - 2026-08-22

### Added & Enhanced
- **Multi-Criteria Task Sorting in Filter Bar**: Added interactive Sort dropdown in `TaskManager.js` supporting dynamic sorting by **Task Name (A → Z)**, **Task Name (Z → A)**, **Due Date (Earliest First)**, **Due Date (Latest First)**, and **Priority (Starred First ⭐)** across active and completed task views.
- **Mandatory Due Date Enforcement on Priority Tasks**: Starring any task in `TaskCard.js`, `TaskDetailDrawer.js`, or `QuickAddTaskModal.js` automatically assigns today's date if empty and enforces a due date.
- **Automated Due-Date & Priority Email Dispatch Engine**: Built a dedicated Due-Date & Priority Task Reminder trigger in `NotificationManagerModal.js` that scans today's scheduled tasks and priority items, compiling and emailing action items to the recipient.
- **Notification Center Tab Restructuring & SMS Gateway Scaffold**: Replaced legacy dispatch debug cards with a streamlined **Automated Dispatches** center featuring sub-tabs for **Email Notifications** (7 AM Digest, Due-Date Reminders, SMTP Test) and **SMS Notifications** (Twilio/carrier provider selector and phone input preview).
- **Open Source Productivity Utilities Suite**: Expanded `ShareRedirectModal.js` with an OSS Utilities suite including direct access to **Excalidraw** (collaborative whiteboard), **CryptPad** (encrypted collaborative docs & sheets), **CyberChef** (data transformations & decoding), and **Draw.io / Diagrams.net** (flowcharts & architecture diagrams) alongside Codeshare and Toffeeshare.
- **Routine Card Layout Stabilization & Universal Crash Guard**: Resolved icon import reference error on recurring routine tasks and locked routine card grid dimensions (`min-h-[230px]`, `line-clamp-2`) in `RoutineManager.js` to eliminate layout shifts when toggling tag filters.

---

## [v1.3.3-beta] - 2026-08-22

### Added & Enhanced
- **SMTP Notification Resiliency & Env Resolver**: Added multi-directory fallback `.env` resolution in `/api/notifications/email` and synchronized workspace root configuration, resolving the missing SMTP env variables alert when Next.js is invoked from workspace root.
- **Dynamic SMTP Health Check & Status Badge**: Added GET diagnostic endpoint `/api/notifications/email` and real-time backend connection status badge in `NotificationManagerModal.js`.
- **Inline Email Recipient Customization**: Added an interactive recipient address input directly inside the "Email & Mobile Dispatch" tab for instant test dispatches and 7:00 AM Morning Digest trigger without needing to switch tabs.
- **End-to-End SMTP Verification**: Verified Gmail SMTP relay (`smtp.gmail.com:587`) dispatch and HTML payload rendering with Quote banner and tabular task summaries.

---

## [v1.3.2-beta] - 2026-08-21

### Added & Enhanced
- **Routine Tag Filtering & Interactive Tag Badges**: Built dedicated Routine Tag Filter toolbar in `RoutineManager.js` displaying all tags present on active routines with count badges. Clicking any tag badge on a routine card or in the toolbar filters routines to show only tasks/habits associated with that tag; clicking "All Routines" or deselecting the tag restores visibility of all scheduled routines.
- **Universal Note Editing at Any Point in Time**: Any note in `NoteCanvas.js` can be opened and edited at any time by clicking the note card or the dedicated Edit pencil icon. Features full editing for title, body content, background color theme, tags, and media attachments with immediate database persistence (`saveNoteToDB`).
- **Scheduled-Time Auto-Population for Routine Tasks in "My Day"**: Routine tasks now strictly auto-populate into "My Day" only when their scheduled target time (`targetTime`) has arrived for today. Once checked off or completed in My Day, routine tasks remain marked as completed for that day and never re-populate as uncompleted duplicate tasks on background DB polling.
- **Database Tag Confirmation & Contextual Tag Scoping**: Verified and confirmed structured persistence of `tags` as JSONB arrays across PostgreSQL (`tasks`, `notes`, `routines` tables) and LocalStorage. Contextualized tag headers in `Sidebar.js` (`Tasks Tags`, `Note Tags`, `Routine Tags`) to keep domain workflows clearly separated.

---

## [v1.3.1-beta] - 2026-08-20

### Added & Enhanced
- **Planned vs. History Calendar View Synchronization**: Clearly separated Planned Calendar (forward-looking due dates) and History Calendar (retrospective completion dates).
- **Integrated Day & Interval Agenda in Calendar**: Selecting any day or date interval (Selected Day, Today, Next 7 Days, Last 7 Days, This Month, Custom Date Range) displays active due tasks and completed tasks directly below the calendar grid.
- **Instant Bidirectional Reactivity**: Checking or unchecking a task directly in the Calendar updates status live with confetti animations, synchronizes to PostgreSQL/LocalStorage, and immediately recalculates calendar day cell count badges (`● Due` ↔ `✓ Done`).
- **Inline Quick Task Addition for Calendar Days**: Added quick "+ Add task for [Selected Date]" input directly in the calendar day agenda header.
- **Modular `TaskCard.js` Extraction**: Extracted `TaskCard` into `src/components/task-manager/TaskCard.js`, eliminating code duplication and standardizing task card interactions across list and calendar views.

---

## [v1.3.0-beta] - 2026-08-20

### Added & Enhanced
- **Architectural Modularity Refactoring**: Decomposed monolithic `TaskManager.js` into clean, maintainable subcomponents (`TaskCalendarView.js`, `QuickAddTaskModal.js`, `TaskDetailDrawer.js`) and isolated domain modules (`dateUtils.js`, `tagUtils.js`, `routineUtils.js`).
- **Flexible Recurrence & Scheduling Engine**: Built universal recurrence engine supporting One-Time (default), Daily, Weekly (multi-day weekday picker, e.g. Mon/Tue/Fri = 3 days/week), Monthly, Yearly, and Custom Interval (`N` Weeks/Days/Months).
- **Max Iterations & Auto-Archiving**: Added iteration count limits to recurring routines/tasks; once maximum completion iterations are reached, the task automatically pauses and moves to the Archived view.
- **Autonomous Slash Commands System (`.agents/commands/`)**: Created custom workspace slash command catalog including `/check-data-flow`, `/check-modularity`, `/scout-skills`, `/refine-prompt`, `/packup`, `/test-db`, `/switch-db`, `/test-email`, `/sync-docs`, and `/build-check`.
- **Workspace Tag Auto-Harvesting & Persistence**: Resolved tag synchronization across refreshes by implementing automatic tag extraction from database items and bidirectional localStorage/DB syncing.
- **Global vs Workspace Customizations Architecture**: Defined guidelines and directory paths for machine-wide (`C:\Users\Admin\.gemini\config\`) vs workspace-level (`.agents/`) skill execution.

---

## [v1.2.0-beta] - 2026-08-16

### Added & Enhanced
- **Tag Management for Members & Admins**: Added inline tag renaming and tag deletion tools in `Sidebar.js` and task cards allowing members and admins to edit tags at any time.
- **Calendar View Numeric Item Counts**: Replaced dot indicators (`.`) in `HistoryCalendar` with clear numeric count badges for active/due tasks, completed tasks, routine completions, and scheduled reminders.
- **Separate Routine Tasks Calendar View**: Introduced dedicated Routine Tasks Calendar mode toggle inside `HistoryCalendar` to track habit execution logs independently.
- **Separated "My Day" Routine Tasks View**: Divided **My Day** view into two distinct visual sections: `☀️ Regular Focus Tasks` and `🔁 Routine Tasks & Daily Habits`.
- **Flexible Date Filter Input**: Enhanced top Date Filter toolbar to support both interactive calendar selection and direct manual text typing (e.g., `YYYY-MM-DD`).
- **Strict Current-Day "My Day" Incomplete Eviction**: Automated daily eviction logic removing incomplete tasks from previous days from My Day so focus list stays strictly tied to today.
- **Streamlined Email Dispatch & Recipient Validation**: Commented out non-email channels for current scope, added recipient email configuration prompt, and enforced alert when recipient email is missing before dispatching notifications.
- **Tabular Email Template Preview with Proverb**: Built interactive **Preview Default Mail Template** modal rendering dark-mode styled HTML task tables and an inspiring quote/proverb footer.

---

### Added & Enhanced
- **Exclusive Floating Action Button (`+`) Modal**: Replaced top inline task creation inputs with a spacious floating action button modal featuring interactive month calendar picker, editable date field, tags, notes, and default `myDay: false`.
- **Enterprise RBAC Framework (`src/config/rbac.json`)**: Configured role-based access control separating `User` and `Admin` permissions. Cleaned up sample starter profiles, ensuring standard users default to `User` role.
- **Top Header Admin Control Button**: Positioned the Admin trigger button (`ShieldCheck` icon) immediately to the right of the Profile pill, strictly guarded by `activeProfile.role === 'Admin'`. Encapsulated Database Status and Version badges inside the Admin Control Panel.
- **LDAP-Style Profile Privacy Lock (`ProfileLockModal.js`)**: Added profile privacy lock screen, 4-digit PIN unlock, PIN change, and PIN reset features.
- **Shared Master Admin PIN across All Admin Accounts**: All Admin role profiles share the same Master Admin Password. Updating the Master Admin PIN from any Admin profile (`test1`, `test2`, etc.) instantly updates it for ALL Admin accounts globally.
- **Admin Panel Member Creation & Management**: Added "Add New Member" form and member promotion/demotion controls inside the Admin Control Panel.
- **First-Time User Interactive Onboarding Tutorial (`FirstTimeTutorialModal.js`)**: Built an interactive 4-step onboarding tutorial that automatically pops up for first-time visitors, guiding users through task creation, workspace navigation, profile lock security, and explicitly directing them to the **User Guide / Manual** button.

---

## [v1.1.0-rc2] - 2026-08-15


### Added & Enhanced
- **Gmail SMTP Nodemailer Transport**: Integrated Nodemailer direct email dispatch endpoint (`/api/notifications/email`) configured with Gmail App Password credentials for automated reminder digests.
- **Serverless NeonDB Profile Sync (`/api/db/profiles`)**: Created dedicated database route and auto-provisioning SQL schema for the `profiles` table in NeonDB PostgreSQL, persisting user profile creations, updates, selections, and deletions live across all devices.
- **Data Re-assignment to Profile "Aditya"**: Set **Aditya** (`p-aditya`, `Admin` role) as primary default profile and re-assigned legacy workspace tasks, notes, routines, and reminders to Aditya's profile.
- **Strict Per-Profile Data Isolation**: Attached `profileId` to task and note creation handlers, enforcing strict profile filtering across Tasks, Notes, Routines, and Reminders when switching profiles.
- **System Admin Control Panel & RBAC (`AdminPanelModal.js`)**: Built dedicated Admin Control Panel featuring Role-Based Access Control (`Admin` ↔ `Member`), system metrics dashboard, live log audit viewer, and 1-click JSON database backup & restore.

---

## [v1.1.0-rc1] - 2026-08-15

### Added & Enhanced
- **Routine Tasks View & Engine (`RoutineManager.js`)**: Dedicated "Routine" sidebar tab with habit cards, frequency controls (Daily, Weekdays, Weekly, Monthly, Custom), and streak & completion metrics.
- **Editable Target Time Field**: Quick inline time editing pill on every routine card and edit modal allowing users to change target execution times anytime.
- **Auto "My Day" Population**: Automatic schedule evaluation on startup/date-change to populate due routine tasks directly into the **My Day** daily focus list.
- **Completion History & Streak Calculation**: Toggling routine tasks complete updates routine completion log dates, calculating active daily streaks (🔥) and 7-day activity matrix badges.

---

## [v1.0.0-rc5] - 2026-08-13

### Added & Enhanced
- **Responsive Calendar UI Overhaul**: Full interactive calendar grid with smooth mobile touch scrolling (`touch-pan-y`), multi-view support (Planned & History sub-views), event activity dots (active due tasks, completed tasks, and scheduled reminders), and day-agenda breakdown drawer.
- **Multi-User Account Profile System**: Created `ProfileManagerModal.js` allowing users to create, edit, customize avatars/colors, and switch between isolated account profiles.
- **Automated Notification & Reminder Center**: Built `NotificationManagerModal.js` supporting Web Browser Push Notifications API, Audio Chime previews, automated client email dispatch (Mailto digest), mobile SMS & WhatsApp deep-link dispatch, and date-based task/group reminder scheduling.

---

## [v1.0.0-rc4] - 2026-08-13

### Added & Enhanced
- **Calendar Tab in History (Enhancement 11)**: Interactive month calendar embedded in the History/Completed view as a sub-tab. Days with completed tasks highlighted in green with dot badges. Clicking any date auto-filters the list to tasks completed that day.
- **Date Filter for History Tab (Enhancement 12)**: Dedicated "Filter History" toolbar with quick presets (All Time, Today, Yesterday, Last 7 Days, This Month) plus From/To custom date range pickers and a Clear Filters button.
- **Inline Task Title Editing (Enhancement 13)**: Pencil icon appears on every task card on hover. Clicking it activates in-place title editing — Enter to save, Escape to cancel, auto-save on blur. Validates against empty titles. Syncs changes to DB immediately.

### Technical Notes
- All three enhancements are **pure UI state changes** in `TaskManager.js` — no database schema changes.
- `HistoryCalendar` added as a standalone component at the bottom of `TaskManager.js`.
- `completedAt` and `createdAt` fields used for calendar activity and date filtering (pre-existing fields).

---

## [v1.0.0-rc3] - 2026-08-11

### Added & Enhanced
- **Everyday Checked Tasks Aging**: Implemented automatic checked tasks aging logic. Completed tasks from previous days are hidden from the active views (My Day, Tasks, Important, Planned) to keep the workspace clean.
- **Completion Date Retention**: Added support for storing completion dates (`completedAt` property) locally and in PostgreSQL (`tasks` table) without altering any existing database data.
- **History & Selected Day Visibility**: Completed tasks remain fully visible under the **History / Completed** sidebar tab and when filtering by their specific completion day in the Date Filter.
- **Timezone-Aware Presets**: Updated all date helpers to use the user's local timezone instead of UTC.

---

## [v1.0.0-rc2] - 2026-08-10

### Changed & Improved
- **Open-Source Sharing Utilities**: Completely rebuilt `ShareRedirectModal.js` — replaced the previous API-based share code generator with two clean, focused tabs:
  - **Codeshare.io Tab**: Direct passcode URL launcher (`codeshare.io/<passcode>`), live URL preview while typing, `localStorage`-persisted **URLs Visited** history with timestamps and individual/bulk remove controls (max 20 entries).
  - **Toffeeshare Tab**: Feature summary card (P2P, no file limit, E2E encrypted, open source) with one-click "Go to Toffeeshare.com" direct link button.
- **Sidebar Cleanup**: Removed "Token Log" and "Daily Logs" operational buttons from footer. Renamed sidebar button from "Codeshare Redirect" → **"Open-Source Sharing Utilities"**.

---

## [v1.0.0-rc1] - 2026-08-10

### Added & Enhanced
- **Real-Time Mobile DB Sync**: 8-second background polling loop (`setInterval`), tab visibility & window focus re-fetch listeners (`visibilitychange`, `focus`, `online`), and interactive **Sync DB** header button.
- **Next.js Dynamic API Cache Bypass**: Configured `export const dynamic = 'force-dynamic'`, `revalidate = 0`, and `Cache-Control: no-store` on database API routes (`/api/db/tasks` & `/api/db/notes`).
- **Multi-Select Bulk Deletion**: Selection mode toggle, Select All / Deselect All controls, Delete Selected (X), and Clear All bulk deletion tools in `TaskManager.js` and `NoteCanvas.js` with batch `DELETE` endpoints.
- **Security & Credential Sanitization**: Sanitized all setup/seed scripts to read `process.env.NEON_DATABASE_URL` dynamically from `.env` and removed raw credentials from git repository history.
- **Strict Storage Safety**: Updated `storage.js` to default to empty arrays `[]` when storage is unpopulated, preventing sample item auto-seeding.

---

## [v1.0.0-beta] - 2026-08-10

### Added & Enhanced
- **NeonDB Serverless PostgreSQL Integration**: Real-time DB sync using `@neondatabase/serverless` with automatic SQL table creation (`tasks` and `notes`).
- **Checked Items & Cut Line History Tab**: Collapsible Completed Items list with checked circles and strikethrough cut lines (`line-through`), plus dedicated **History / Completed** sidebar tab.
- **Codeshare.io & Toffeeshare Hub**: Customizable room passcodes (`codeshare.io/<your-passcode>`) and direct Toffeeshare file redirection.
- **Interactive Task Due Date Picker & Filters**: Task Card due date popovers, Task Drawer date selector block, and top Date Sub-Filter toolbar.
- **User Guide & Documentation Suite**: Interactive 6-tab **User Guide Modal** in UI (`BookOpen`) and comprehensive `DOCUMENTATION.md`.
- **Roadmap Updates in ENHANCEMENTS.md**: Advance reminders, SMTP email service, Mobile Web Push & Telegram bot messaging, and daily recurring task auto-population.

---

## [v1.0.0-alpha] - 2026-08-10

### Added
- **Core Workspace App**: Hybrid Task Manager & Note Vault named **TaskPulse**.
- **Microsoft To-Do Features**: My Day view, checklists, due date tracking, priority starring.
- **Google Keep Features**: Visual grid/masonry cards, custom card color palettes, pin to top, multi-tag system.
- **Apple Reminders Features**: Smart views (Today, Scheduled, Flagged, All), attachment upload system (Images, Audio, Video, Files).
- **Codeshare / Toffeeshare Redirect**: Dynamic code link generator (`/share/[code]`) with redirect & instant code/note preview.
- **Operational Infrastructure**: Daily logger under `logs/log_YYYY-MM-DD.log`, `token_usage.md`, `VERSION.md`, `ENHANCEMENTS.md`.
