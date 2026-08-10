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
