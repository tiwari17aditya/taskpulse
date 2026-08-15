# TaskPulse Enterprise Application

TaskPulse is a modern, full-stack productivity workspace built with Next.js 14 App Router, React 19, Tailwind CSS, and NeonDB PostgreSQL.

## 📁 Clean Directory Architecture

```
taskpulse/
├── src/                      # Application Core (Frontend UI + Backend API)
│   ├── app/                  # Next.js App Router (Pages & Backend Serverless API Routes)
│   │   ├── api/              # Backend API Endpoints (db/tasks, db/notes, db/profiles, notifications)
│   │   └── page.js           # Main Workspace View
│   ├── components/           # React UI Components (TaskManager, NoteCanvas, RoutineManager, etc.)
│   ├── config/               # App System Configurations (rbac.json)
│   └── lib/                  # Utilities, Local Storage Engine & Database Adapters
├── docs/                     # Documentation & User Guides
│   └── DOCUMENTATION.md      # Full Technical & User Manual
├── tracker/                  # Progress, Versioning & Metrics Tracker
│   ├── token_usage.md        # Session Metrics & Cost Tracking
│   ├── VERSION.md            # Release History & Versioning
│   └── ENHANCEMENTS.md       # Roadmap & Feature Backlog
├── logs/                     # Daily System Audit Logs (log_YYYY-MM-DD.log)
├── samples/                  # Database Scripts & Sample Resources
│   └── scripts/              # NeonDB Setup, Seeding & Clear Scripts
├── public/                   # Static Assets & Icons
└── package.json              # Project Dependencies & Scripts
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build & verification
npm run build
```

For full setup, architecture details, and RBAC documentation, see [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md).
