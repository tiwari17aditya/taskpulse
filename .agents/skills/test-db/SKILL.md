---
name: test-db
description: Automated connectivity, query latency, and schema diagnostics for NeonDB, Supabase, or Local DB providers.
---

# Database Diagnostic Skill (`/test-db`)

## Workflow:
1. Read `NEXT_PUBLIC_DB_PROVIDER` and DB connection strings from `.env`.
2. Send test query to `/api/db/tasks` and `/api/db/notes`.
3. Check table creation DDL and verify primary keys and JSONB columns.
4. Report provider status, response time, and record counts.
