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

## Session Packup Workflow (`/packup`)
When the user triggers `/packup` or requests a session packup:
1. **Git & GitHub Push**: Execute `git add .`, `git commit`, and `git push` to synchronize all workspace commits to GitHub `main`.
2. **Operational Tracking Audit**: Ensure `audits/token_usage.md`, `audits/logs/log_YYYY-MM-DD.log`, `audits/VERSION.md`, and `docs/DOCUMENTATION.md` are 100% updated with current session metrics.
3. **Warm Farewell**: Provide a clear session summary and conclude with an inspiring, positive quote.
