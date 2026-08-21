---
name: add-tag-feature
description: Scaffolds or updates tag filtering and aggregation logic consistently across TaskManager.js, Sidebar.js, and NoteCanvas.js.
---

# Tag Management & Feature Skill (`/add-tag-feature`)

Provides unified tag extraction, filtering, color-coding, and search synchronization across tasks and sticky notes.

## Workflow:
1. **Utility Aggregation**: Utilize `src/lib/tagUtils.js` for tag normalization, deduplication, and hashtag extraction.
2. **UI Synchronization**: Update tag selectors in `TaskManager.js`, `TaskDetailDrawer.js`, `NoteCanvas.js`, and the tag browser in `Sidebar.js`.
3. **Database Serialization**: Ensure tag arrays are stored cleanly as JSONB arrays in Postgres or JSON strings in LocalStorage.
