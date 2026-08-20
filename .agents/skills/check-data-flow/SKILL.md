---
name: check-data-flow
description: End-to-end data pipeline validation from UI component state to API route serialization and structured database tables.
---

# Data Flow Validation Skill (`/check-data-flow`)

Use this workflow to verify that UI inputs and state persist reliably into the active database without loss or schema mismatches.

## Step-by-Step Procedure:
1. **Inspect UI Handlers**: Check state setters in `src/components/TaskManager.js` and `src/components/KeepNotes.js` for payload construction (e.g., subtasks array, media JSON, tags, routine habits, notes body).
2. **Verify API Routes**: Inspect `/api/db/tasks/route.js` and `/api/db/notes/route.js` to ensure incoming JSON payloads are sanitized, types cast properly, and parameterized queries match the schema.
3. **Database Schema Alignment**: Verify active schema in NeonDB/Supabase (`tasks`, `notes`, `profiles`) matches all UI fields (`id`, `title`, `completed`, `myDay`, `subtasks`, `tags`, `notes`, `media`, `createdAt`, `completedAt`).
4. **Adapter Check**: Ensure fallback to `localStorage` in `src/lib/storage.js` preserves the exact same JSON format when offline or in local mode.
