# `/test-db` - Database Connectivity & Schema Diagnostics

## Overview
Executes live diagnostics against the configured active database provider (`NeonDB`, `Supabase`, or `Local`) to verify connection status, query latency, and schema integrity.

## Execution Workflow
1. **Config Extraction**:
   - Inspect `.env` for `NEXT_PUBLIC_DB_PROVIDER`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and keys.
2. **Ping & Latency Check**:
   - Dispatch test query to `/api/db/tasks` and measure roundtrip response time in milliseconds.
3. **Table Verification**:
   - Verify table structure (`tasks`, `notes`, `profiles`) and confirm JSONB columns exist.
4. **Report**:
   - Output summary table with status, latency (ms), provider name, and row counts.
