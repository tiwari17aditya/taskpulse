# TaskPulse Enterprise Application

TaskPulse is a modern, full-stack productivity workspace built with Next.js 14 App Router, React 19, Tailwind CSS, and NeonDB PostgreSQL.

## 📁 Clean & Modular Directory Architecture

```
taskpulse/
├── .agents/                    # Workspace Agent Rules & Modular Domain Skills
│   ├── AGENTS.md               # Coding Guidelines & Anti-Hallucination Rules
│   └── skills/                 # Domain Skill Modules
├── samples/                    # Database Scripts & Sample Resources
│   └── scripts/                # NeonDB Setup, Seeding & Clear Utility Scripts
├── src/                        # Application Core (Frontend UI + Backend API Routes)
│   ├── app/                    # Next.js App Router (Pages & Backend Serverless API Routes)
│   │   ├── api/                # Backend API Endpoints (db/tasks, db/notes, db/profiles, notifications)
│   │   └── page.js             # Main Workspace View
│   ├── components/             # Frontend React UI Components
│   ├── config/                 # System Configurations (rbac.json)
│   └── lib/                    # Storage Engine & Database Adapters
├── public/                     # Static Assets & Icons
├── audits/                     # Trackers, Metrics, Versioning & Audit Logs
│   ├── token_usage.md          # Session Metrics & Cost Tracker
│   ├── VERSION.md              # Release History & Versioning
│   ├── ENHANCEMENTS.md         # Roadmap & Feature Backlog
│   └── logs/                   # System Audit Logs (log_YYYY-MM-DD.log)
├── docs/                       # Documentation & User Guides
│   └── DOCUMENTATION.md        # Full Technical & User Manual
├── package.json                # Build Dependencies & Scripts
├── next.config.mjs             # Next.js Config
├── tailwind.config.js          # Tailwind CSS Config
├── postcss.config.js           # PostCSS Config
├── jsconfig.json               # Path Alias Config (@/* -> ./src/*)
├── vercel.json                 # Vercel Deployment Preset
└── README.md                   # Root Directory Overview Guide
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

## 📚 Documentation & Technical Specifications

- 📖 [User Manual & System Documentation](docs/DOCUMENTATION.md)
- 🏛️ [Tech Stack Compendium & Architecture Diagrams](docs/TECH_STACK.md)
- 📋 [Release Changelog & Version History](audits/VERSION.md)
- ⚡ [Custom Slash Commands & Agent Skills](.agents/commands/COMMANDS.md)
