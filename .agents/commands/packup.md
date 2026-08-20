# `/packup` - Session Completion & GitHub Sync

## Overview
Automates the full end-of-session wrap-up: stages workspace changes, creates structured git commits, pushes to GitHub `main`, updates operational trackers (`audits/token_usage.md`, `audits/logs/`, `audits/VERSION.md`, `docs/DOCUMENTATION.md`), and presents a concluding summary with an inspiring quote.

## Execution Workflow
1. **Git Operations**:
   - `git add .`
   - `git commit -m "<conventional-commit-message>"`
   - `git push origin main`
2. **Operational Logging**:
   - Record token usage in `audits/token_usage.md`.
   - Log daily event summary in `audits/logs/log_YYYY-MM-DD.log`.
3. **Documentation Check**:
   - Confirm `docs/DOCUMENTATION.md` and `audits/VERSION.md` reflect all latest changes.
4. **Session Summary**:
   - Output closing metrics and an inspiring quote.
