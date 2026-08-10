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
