# `/check-data-flow` - End-to-End Data Flow & Schema Validation

## Overview
Validates that all content added, updated, or removed via the UI (for current and future features) correctly synchronizes, serializes, and persists into the active database in a structured format without data truncation, type mismatch, or schema breakage.

## Execution Workflow
1. **Frontend UI State Inspection**:
   - Check UI component state setters in `src/components/TaskManager.js` and `src/components/KeepNotes.js`.
   - Verify payload shapes for tasks, subtasks (`JSON`), routine logs (`JSON`), tags (`JSON`), notes body, media attachments (`JSON`), and profile data.
2. **API Route Handler Verification**:
   - Inspect `/api/db/tasks/route.js` and `/api/db/notes/route.js`.
   - Verify parameter binding, sanitization, and SQL query formatting.
3. **Database Schema & Table Alignment**:
   - Check that active database tables (`tasks`, `notes`, `profiles`) in NeonDB/Supabase contain the exact expected column types and constraints.
4. **Fallback & Local Cache Validation**:
   - Verify `src/lib/storage.js` and `src/lib/dbAdapter.js` preserve data structure when operating in fallback/offline mode.
5. **Output Diagnostic Report**:
   - Return validation status (PASS/FAIL) with any schema drift or payload discrepancies.
