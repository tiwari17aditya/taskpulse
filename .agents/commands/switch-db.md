# `/switch-db` - Universal Database Provider Switcher

## Overview
Switches the active database provider across `neondb`, `supabase`, or `local`, validates credentials in `.env`, and tests the universal database adapter in `src/lib/dbAdapter.js`.

## Usage
- `/switch-db neondb`
- `/switch-db supabase`
- `/switch-db local`

## Execution Workflow
1. Update `NEXT_PUBLIC_DB_PROVIDER` in `.env`.
2. Check that relevant environment keys exist for the chosen provider.
3. Validate client initialization in `src/lib/dbAdapter.js` and `src/lib/supabaseClient.js`.
4. Run connectivity smoke test against `/api/db/tasks`.
