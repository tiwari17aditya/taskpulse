# `/add-tag-feature` - Tag Scaffolding & Sync

## Overview
Ensures any new tag management or filtering functionality is applied consistently across all three core visual modules: `TaskManager.js` (tasks), `Sidebar.js` (global tag navigation), and `KeepNotes.js` (note cards).

## Execution Workflow
1. Check tag CRUD methods in `Sidebar.js` (create, rename, delete).
2. Propagate tag changes to `TaskManager.js` filter pills.
3. Propagate tag changes to `KeepNotes.js` card badges.
4. Verify JSON persistence for tags in `/api/db/tasks` and `/api/db/notes`.
