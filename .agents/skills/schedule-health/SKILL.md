---
name: schedule-health
description: Spawns a background schedule recurring timer for periodic automated health diagnostics.
---

# Periodic Health Diagnostics Skill (`/schedule-health`)

Sets up automated background health checks for database connectivity, route response times, and storage integrity.

## Workflow:
1. Schedule a recurring diagnostic check using the background scheduler.
2. Run database ping via `dbAdapter.js` and verify table record counts.
3. Log results to `audits/logs/log_YYYY-MM-DD.log`.
