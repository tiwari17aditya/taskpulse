# Project Rules & Workspace Guidelines

## Token Optimization & Context Scoping
- **Targeted Code Scans**: Always inspect only specific target files or directories required for a task to minimize context bloat and token consumption.
- **Skill-Based Context Loading**: Modularize domain logic into dedicated skills under `.agents/skills/<skill-name>/SKILL.md`.

## Project Conventions
- **Framework**: Next.js App Router (React 19 / 18, Server Components + Client Components where interactive state is needed).
- **Styling**: Tailwind CSS + Custom CSS Variables + Lucide React Icons. Dark mode as primary visual palette.
- **Operational Files**:
  - `token_usage.md`: Update tabular record upon completing major task operations.
  - `logs/log_YYYY-MM-DD.log`: Log info/error events for daily tracking under `logs/`.
  - `VERSION.md`: Update version releases.
  - `ENHANCEMENTS.md`: Document future roadmap items (including LDAP integration).

## Strict Anti-Hallucination & Feature Verification Rule
- **No Hallucinations**: Never claim a feature exists, was tested, or is implemented unless strictly verified in the codebase.
- **Clarify When Uncertain**: If any requirement is ambiguous, underspecified, or confusing, explicitly ask the user for clarification before assuming or generating incorrect code.

## Session Packup Workflow (`/packup`)
When the user triggers `/packup` or requests a session packup:
1. **Git & GitHub Push**: Execute `git add .`, `git commit`, and `git push` to synchronize all workspace commits to GitHub `main`.
2. **Operational Tracking Audit**: Ensure `token_usage.md`, `logs/log_YYYY-MM-DD.log`, `VERSION.md`, and `DOCUMENTATION.md` are 100% updated with current session metrics.
3. **Warm Farewell**: Provide a clear session summary and conclude with an inspiring, positive quote.

