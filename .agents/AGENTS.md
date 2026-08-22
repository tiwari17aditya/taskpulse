# Project Rules & Workspace Guidelines

## Token Optimization & Context Scoping
- **Targeted Code Scans**: Always inspect only specific target files or directories required for a task to minimize context bloat and token consumption.
- **Skill-Based Context Loading**: Modularize domain logic into dedicated skills under `.agents/skills/<skill-name>/SKILL.md`.

## Project Directory Organization
- **Application Core**: `src/` (All frontend UI components, Next.js App Router pages, backend serverless API routes, and lib utilities).
- **Tracker & Metrics**: `audits/` (`audits/token_usage.md`, `audits/VERSION.md`, `audits/ENHANCEMENTS.md`).
- **Logs**: `audits/logs/` (`audits/logs/log_YYYY-MM-DD.log`).
- **Documentation**: `docs/` (`docs/DOCUMENTATION.md`).
- **Samples & Utilities**: `samples/` (`samples/scripts/`).

## Project Conventions
- **Framework**: Next.js App Router (React 19 / 18, Server Components + Client Components where interactive state is needed).
- **Styling**: Tailwind CSS + Custom CSS Variables + Lucide React Icons. Dark mode as primary visual palette.
- **Operational Files**:
  - `audits/token_usage.md`: Update tabular record upon completing major task operations.
  - `audits/logs/log_YYYY-MM-DD.log`: Log info/error events for daily tracking under `audits/logs/`.
  - `audits/VERSION.md`: Update version releases.
  - `audits/ENHANCEMENTS.md`: Document future roadmap items (including LDAP integration).

## Strict Anti-Hallucination & Feature Verification Rule
- **No Hallucinations**: Never claim a feature exists, was tested, or is implemented unless strictly verified in the codebase.
- **Clarify When Uncertain**: If any requirement is ambiguous, underspecified, or confusing, explicitly ask the user for clarification before assuming or generating incorrect code.

## Continuous Documentation & UI Version Maintenance Rule
- **Always Keep User Manual & Version Up to Date**: Whenever enhancing the project, adding features, or modifying security/UI workflows, ALWAYS update `docs/DOCUMENTATION.md` (User Manual), `audits/VERSION.md` (Release History), and the in-app UI version badges to reflect the exact state of the project.

## Custom Workspace Slash Commands System

You can trigger any of these commands at any time in chat. Type `/commands` to view this list:

| Command | Action & Workflow |
| :--- | :--- |
| `/commands` | Displays the interactive directory of all available TaskPulse workspace slash commands. |
| `/check-data-flow` | Performs end-to-end data flow validation: inspects UI state handlers (tasks, subtasks, notes, routines, tags, media attachments), verifies API serialization (`/api/db/tasks`, `/api/db/notes`), and confirms structured DB persistence & retrieval across the active provider (NeonDB/Supabase/Local). |
| `/check-modularity` | Scans codebase for oversized components (>400 lines) and inlined business logic, refactoring them into clean sub-modules and domain utilities. |
| `/scout-skills` | Analyzes codebase patterns and proactively scaffolds new custom skills and commands. |
| `/refine-prompt` | Optimizes and enriches user prompts with repository context and constraints for maximum output precision. |
| `/packup` | Executes git stage, commit, push to GitHub `main`, updates `audits/token_usage.md`, `audits/logs/log_YYYY-MM-DD.log`, `audits/VERSION.md`, `docs/DOCUMENTATION.md`, and concludes with a session closing report. |
| `/test-db` | Runs connectivity, table schema (`tasks`, `notes`), and latency diagnostics against the active DB provider in `.env`. |
| `/switch-db [provider]` | Updates `NEXT_PUBLIC_DB_PROVIDER` (to `neondb`, `supabase`, or `local`), tests connection, and validates adapter readiness in `src/lib/dbAdapter.js`. |
| `/test-email` | Dispatches a test formatted HTML email payload with the quote/proverb banner via `/api/notifications/email` to verify Nodemailer SMTP delivery. |
| `/sync-docs` | Reconciles recent feature additions across `docs/DOCUMENTATION.md`, in-app `UserGuideModal.js`, and `audits/VERSION.md`. |
| `/build-check` | Executes `npm run build` in `main-code/` to verify zero SSR/App Router hydration or compilation errors prior to deployment. |
| `/clean-logs` | Archives or trims daily log files in `audits/logs/` older than 14 days and rollups token counts. |
| `/add-tag-feature` | Scaffolds or updates tag filtering logic consistently across `TaskManager.js`, `Sidebar.js`, and `KeepNotes.js`. |
| `/audit-tokens` | Appends session token consumption metrics directly to `audits/token_usage.md`. |
| `/bump-version [version]` | Increments version across `package.json`, `audits/VERSION.md`, `docs/DOCUMENTATION.md`, and the in-app navbar badge. |
| `/verify-routes` | Tests dynamic route generation for `/share/[code]` and CRUD API endpoints. |
| `/manage-vercel [mode]` | Automates Vercel linking, zero-effort batch .env sync (push/pull), pre-flight build diagnostics, and live production deployment (`inspect`, `push`, `pull`, `deploy`, `status`). |
| `/schedule-health` | Spawns a background `/schedule` recurring timer for periodic automated health diagnostics. |

## Session Packup Workflow (`/packup`)
When the user triggers `/packup` or requests a session packup:
1. **Git & GitHub Push**: Execute `git add .`, `git commit`, and `git push` to synchronize all workspace commits to GitHub `main`.
2. **Operational Tracking Audit**: Ensure `audits/token_usage.md`, `audits/logs/log_YYYY-MM-DD.log`, `audits/VERSION.md`, and `docs/DOCUMENTATION.md` are 100% updated with current session metrics.
3. **Warm Farewell**: Provide a clear session summary and conclude with an inspiring, positive quote.

