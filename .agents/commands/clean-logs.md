# `/clean-logs` - Log Archival & Housekeeping

## Overview
Cleans up and archives daily log files in `audits/logs/` that are older than 14 days, and calculates a summary rollup of historical token metrics.

## Execution Workflow
1. List all `audits/logs/log_*.log` files.
2. Identify files older than 14 days.
3. Consolidate error and info logs into an archive or trim them.
4. Update `audits/token_usage.md` with aggregated totals.
