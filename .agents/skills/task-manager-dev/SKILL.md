---
name: task-manager-dev
description: Instructions and guidelines for modifying Microsoft To-Do style task manager features including subtasks, My Day, priorities, and due dates.
---

# Task Manager Skill Guidelines

When editing task management features:
1. Refer to `src/components/TaskManager.js` for task drawer and checklist state.
2. Ensure `myDay`, `starred`, `dueDate`, `subtasks`, and `tags` properties match `src/lib/storage.js` schema.
3. Preserve interactive confetti celebrations on task completion.
4. Scope code edits strictly to `TaskManager.js` and `page.js`.
