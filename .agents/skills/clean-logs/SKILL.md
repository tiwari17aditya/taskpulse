---
name: clean-logs
description: Archives or trims daily log files in audits/logs/ older than 14 days and rollups token counts.
---

# Log Cleanup & Archival Skill (`/clean-logs`)

Maintains clean operational storage by archiving dated log files while preserving historical token summaries.

## Workflow:
1. Scan `audits/logs/` for files matching `log_YYYY-MM-DD.log`.
2. Extract summary token statistics and append to `audits/token_usage.md` if not already rolled up.
3. Archive or trim logs exceeding 14 days.
