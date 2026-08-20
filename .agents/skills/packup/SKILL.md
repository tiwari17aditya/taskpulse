---
name: packup
description: Complete end-of-session workflow: git commit & push, token audit logging, daily log entry, docs update, and closing report.
---

# Session Packup Workflow Skill (`/packup`)

## Workflow:
1. Stage modified files: `git add .`
2. Commit with meaningful conventional commit message: `git commit -m "..."`
3. Push to upstream: `git push origin main`
4. Update `audits/token_usage.md` with session metrics.
5. Record log entry in `audits/logs/log_YYYY-MM-DD.log`.
6. Ensure `audits/VERSION.md` and `docs/DOCUMENTATION.md` are aligned.
7. Conclude with an inspiring session summary and positive quote.
