# Version History

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
