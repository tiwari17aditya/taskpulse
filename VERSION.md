# Version History

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
