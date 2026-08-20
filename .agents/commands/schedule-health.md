# `/schedule-health` - Background Automated Health Monitoring

## Overview
Spawns an autonomous background `/schedule` recurring cron timer to perform periodic database, API, and build checks without interrupting your active development.

## Execution Workflow
1. Initialize `/schedule` recurring cron job (e.g. `*/30 * * * *`).
2. Run database latency test and route checks on each tick.
3. If an anomaly or error occurs, trigger a high-priority alert in chat.
4. Otherwise, silently record a heartbeat entry into `audits/logs/`.
