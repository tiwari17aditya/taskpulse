---
name: switch-db
description: Updates NEXT_PUBLIC_DB_PROVIDER (neondb, supabase, local), tests connection, and validates adapter readiness in src/lib/dbAdapter.js.
---

# Database Provider Switching Skill (`/switch-db`)

Seamlessly switches the active database provider across NeonDB, Supabase, and Local Browser Storage.

## Workflow:
1. **Validate Target Provider**:
   - Supported values: `neondb` | `supabase` | `local`.
2. **Environment Update**:
   - Set `NEXT_PUBLIC_DB_PROVIDER=<provider>` in `main-code/.env`.
3. **Connection Verification**:
   - If `neondb`: Verify `DATABASE_URL` / `NEON_DATABASE_URL` connectivity and table schema (`tasks`, `notes`).
   - If `supabase`: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - If `local`: Verify `src/lib/storage.js` fallback handler is active.
4. **Adapter Testing**:
   - Run connectivity test via `samples/scripts/verify_insert.mjs` or `/api/db/tasks`.
