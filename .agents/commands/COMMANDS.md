# ⚡ TaskPulse Workspace Slash Commands Directory

All slash commands have dedicated Markdown definition files inside the [`.agents/commands/`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands) directory.

## 📋 Available Commands & Links

| Command | Definition File | Purpose & Action |
| :--- | :--- | :--- |
| **`/check-data-flow`** | [`check-data-flow.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/check-data-flow.md) | End-to-end data pipeline validation from UI state to API route serialization and structured database tables. |
| **`/check-modularity`** | [`check-modularity.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/check-modularity.md) | Audits codebase for architectural modularity, oversized files, and decomposes monolithic logic into clean sub-components. |
| **`/scout-skills`** | [`scout-skills.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/scout-skills.md) | Analyzes codebase patterns and proactively scaffolds new custom skills and commands. |
| **`/refine-prompt`** | [`refine-prompt.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/refine-prompt.md) | Optimizes and enriches user prompts with repository context and constraints for maximum output precision. |
| **`/packup`** | [`packup.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/packup.md) | Automated git commit, push, token audit logging, daily log entry, and closing report. |
| **`/test-db`** | [`test-db.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/test-db.md) | Diagnostics for database connectivity, query latency, and table schemas. |
| **`/switch-db`** | [`switch-db.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/switch-db.md) | Switch database provider (`neondb`, `supabase`, `local`) in `.env` and verify adapters. |
| **`/test-email`** | [`test-email.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/test-email.md) | Dispatches test email with task table and quote banner via Nodemailer SMTP. |
| **`/sync-docs`** | [`sync-docs.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/sync-docs.md) | Synchronizes `docs/DOCUMENTATION.md`, `UserGuideModal.js`, and `audits/VERSION.md`. |
| **`/build-check`** | [`build-check.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/build-check.md) | Pre-flight Next.js build and hydration verification before deployment. |
| **`/clean-logs`** | [`clean-logs.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/clean-logs.md) | Archives or trims daily logs older than 14 days and aggregates token usage. |
| **`/add-tag-feature`** | [`add-tag-feature.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/add-tag-feature.md) | Scaffolds or updates tag filtering logic consistently across TaskManager, Sidebar, and KeepNotes. |
| **`/audit-tokens`** | [`audit-tokens.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/audit-tokens.md) | Appends session token consumption metrics directly to `audits/token_usage.md`. |
| **`/bump-version`** | [`bump-version.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/bump-version.md) | Increments version across `package.json`, `audits/VERSION.md`, `docs/DOCUMENTATION.md`, and UI badges. |
| **`/verify-routes`** | [`verify-routes.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/verify-routes.md) | Tests dynamic route generation for `/share/[code]` and CRUD API endpoints. |
| **`/manage-vercel`** | [`manage-vercel.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/manage-vercel.md) | Automates Vercel linking, zero-effort batch .env push/pull, pre-flight build diagnostics, and live production deployment. |
| **`/schedule-health`** | [`schedule-health.md`](file:///d:/Antigravity-Projects/taskpulse/.agents/commands/schedule-health.md) | Spawns a background `/schedule` recurring timer for periodic automated health diagnostics. |

---

## How to Trigger
Simply type any command (e.g. `/check-data-flow` or `/commands`) directly into the chat prompt.
