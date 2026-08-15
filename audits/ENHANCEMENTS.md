# TaskPulse - Feature Enhancements & Future Roadmap

This document outlines the architectural roadmap, upcoming core features, notifications & messaging integrations, and enterprise enhancements planned for TaskPulse.

---

## 1. Advance Task Reminder & Notification Engine
- **Advance Trigger Presets**: Configure alerts **15 minutes**, **1 hour**, **1 day**, or **custom advance duration** prior to scheduled task due times.
- **In-App Visual & Sound Alerts**: Native browser audio chime and floating banner notifications when due dates approach.
- **Smart Due Date Monitor**: Background cron worker checking pending tasks and firing timely reminders.

---

## 2. SMTP Email Notification Service (Nodemailer / Resend)
- **Protocol**: Standard SMTP integration (Nodemailer / Resend / SendGrid Free Tier).
- **Features**:
  - **Due Date Email Alerts**: Automated advance reminder emails containing task title, priority, subtasks checklist, and direct action links.
  - **Daily Morning Digest**: Optional 8:00 AM summary email listing all tasks scheduled in **My Day** for the morning focus session.
  - **Configurable Credentials**: Central `.env` options (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`).

---

## 3. Mobile Phone Direct Messaging & Push Service (Free / Open Source)
- **Web Push API (VAPID Keys)**: Direct push notifications delivered straight to user mobile devices (iOS / Android) even when browser is in background.
- **Telegram Bot API (100% Free & Open Source)**:
  - Instant Telegram mobile messages delivered to user's phone for upcoming task reminders.
  - Interactive inline buttons on Telegram to mark task as completed or postpone directly from phone.
- **Twilio SMS / WhatsApp Business API**: Optional SMS and WhatsApp messaging integration for critical high-priority starred tasks.

---

## 4. Recurring Task Engine & Auto "My Day" Auto-Population
- **Recurrence Frequencies**: Daily, Weekdays, Weekly, Monthly, or Custom Cron Schedules (e.g., *every Monday & Thursday at 9:00 AM*).
- **Auto "My Day" Reset**: Everyday at midnight / 6:00 AM, active recurring tasks automatically reset and populate into the **My Day** view.
- **Recurrence Duration Controls**: Set recurrence to run indefinitely, for a specific date range, or until user deactivates the schedule.

---

## 5. Enterprise LDAP Authentication (v2.0 Release)
- **Protocol**: Standard LDAP / Active Directory connection using `ldapjs`.
- **Features**:
  - Enterprise Single Sign-On (SSO) using corporate directory credentials.
  - User Group mapping to role-based access control (RBAC).
  - Configurable LDAP server URI, Bind DN, Search Base, and SSL/TLS certificates.
  - Fallback authentication strategy for offline local users.

---

## 6. Peer-to-Peer Direct File & Stream Sharing (Toffeeshare P2P WebRTC)
- **WebRTC DataChannels**: Zero-server, direct browser-to-browser P2P file transfers without file size limits.
- **End-to-End Encryption (E2EE)**: Ephemeral AES-GCM 256-bit key generation per share session.

---

## 7. AI Smart Assistant & Voice Note Transcriber
- **Natural Language Task Parsing**: Type or speak *"Remind me to submit Q3 report tomorrow at 4 PM"* to auto-populate title, due date, time, and tags.
- **Voice Notes Transcription**: Web Speech API / OpenAI Whisper Web AI for auto-transcribing voice recordings into searchable note text.

---

## 8. Offline Progressive Web App (PWA) Support
- **ServiceWorker Caching**: Complete offline access for tasks, notes, and local media.
- **IndexedDB Background Sync**: Automatic synchronization with NeonDB PostgreSQL and Supabase Cloud when internet connection is restored.

---

## 9. Real-Time Collaborative Code & Notes Editor (Codeshare Sync)
- **Monaco Editor / CodeMirror**: Full syntax highlighting for JS, Python, Go, SQL, HTML/CSS.
- **Live Multi-User Cursors**: Yjs CRDT real-time multi-user cursor sync per shared passcode room.

---

## 10. Universal Data Import Engine (Google Keep, Apple Notes, Joplin, Notion, CSV/JSON)
- **Google Keep Takeout Import**: Parse Google Takeout JSON files (including background color, pinned status, tags, and image/audio attachments).
- **Apple Notes Import**: Parse exported HTML/txt files and attachments from Apple Notes / Exporter tool.
- **Joplin Raw & JEX Importer**: Import Joplin `.jex` export archives and raw Markdown notes with folder structures and tag metadata.
- **Notion Workspace Import**: Parse Notion zip exports containing `.md` and `.csv` pages, database rows, checklists, and media files.
- **Universal CSV & JSON Importer**: Drag-and-drop CSV / JSON file importer with field mapping wizard for bulk importing tasks, subtasks, due dates, and note cards.

---

## 11. Calendar Tab for History Navigation & Date-Based Task Access
- **Dedicated Calendar View**: A full interactive calendar panel embedded as a tab inside the **History** section, allowing users to visually browse past task activity by day, week, or month.
- **Date-Click Navigation**: Clicking any date on the calendar instantly filters and jumps to all tasks that were completed, created, or modified on that specific date.
- **Month/Week/Day Toggle**: Switch between month overview, weekly agenda, and single-day drill-down modes for flexible history exploration.
- **Visual Activity Indicators**: Highlight dates that have task activity with colored dots or badges (e.g., green for completed, orange for overdue) for quick visual scanning.

---

## 12. Date Filter for History Tab
- **Date Range Picker**: Add a **From / To** date range picker at the top of the History tab to filter task history within any custom date window.
- **Quick Presets**: One-click filter presets — *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *This Month*, *Custom Range*.
- **Combined Filters**: Allow combining date filters with existing status, priority, or tag filters for precise history queries.
- **Clear & Reset**: A single "Clear Filters" button resets all active date and category filters back to the full history view.

---

## 13. Inline Task Title Editing
- **Edit Button per Task Card**: Every task card displays a dedicated **Edit (pencil) icon** on hover or tap, accessible at all times across all views (My Day, Tasks, History, etc.).
- **Inline Edit Mode**: Clicking the edit icon transforms the task title into an editable text field in-place — no modal or page navigation required.
- **Keyboard Shortcuts**: Press **Enter** to save the updated title or **Escape** to discard changes and revert to the original title instantly.
- **Auto-Save on Blur**: If the user clicks away from the field, the updated title is automatically saved to prevent accidental data loss.
- **Validation**: Empty or whitespace-only titles are rejected with an inline error hint, ensuring every task always has a valid title.

---

## 14. Audit of Discovered Edge-Case Bugs & Rigorous Testing Findings (Resolved v1.1.0-beta)

Through rigorous end-to-end scenario testing across multi-role workflows (Member creation, Admin promotion/demotion, profile privacy locking/unlocking, master PIN updates, and background DB polling), the following edge-case bugs were audited and resolved:

### 🐛 Bug 1: Master Admin Password DB Sync Persistence
- **Symptom**: Updating the shared Master Admin Password in `ProfileLockModal` updated local storage (`pulse_admin_master_pin_v1`), but did not push updated profile PINs to NeonDB PostgreSQL.
- **Fix**: Updated `ProfileLockModal` to update all Admin profile records in state and trigger `onSaveProfiles(updatedProfiles)` so the new Master PIN is immediately saved to the database.

### 🐛 Bug 2: Admin Reset User PIN Left Profile Locked
- **Symptom**: When an Admin clicked "Reset PIN" for a locked user profile, `pin` was set to `'1234'`, but `isLocked` remained `true`.
- **Fix**: Updated `handleResetUserPinByAdmin` in `AdminPanelModal` to set `pin: '1234'` AND `isLocked: false` so locked-out users are immediately unlocked and restored.

### 🐛 Bug 3: Modal Stacking & Backdrop Overlap on Profile Switch
- **Symptom**: Selecting a profile in `ProfileManagerModal` triggered `ProfileLockModal`, but `ProfileManagerModal` remained open beneath it, causing backdrop & z-index collisions.
- **Fix**: Enforced automatic closing of `ProfileManagerModal` (`setShowProfileModal(false)`) whenever `ProfileLockModal` opens for PIN verification.

### 🐛 Bug 4: Demoted Admin Role PIN Synchronization
- **Symptom**: Demoting an `Admin` to `Member` in `AdminPanelModal` left their profile `pin` as default `'1234'` without syncing the Master PIN they used while an Admin.
- **Fix**: Synchronized profile `pin` with Master Admin PIN when transitioning role from `Admin` to `Member` in `handleRoleToggle`.

### 🐛 Bug 5: Periodic 8-Second DB Polling Re-Lock Safeguard
- **Symptom**: Background polling every 8s (`syncDataFromDB`) updated `activeProfile` state while a user was on the lock screen, causing transient profile state changes before PIN unlock.
- **Fix**: Added active lock guard in `app/page.js` to preserve `isProfileUnlocked` state during background polling synchronization.


