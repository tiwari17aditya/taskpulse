---
name: check-modularity
description: Scans codebase for oversized components (>400 lines) and inlined logic, refactoring into clean, detachable sub-modules.
---

# Codebase Modularity & Decomposition Skill (`/check-modularity`)

Use this skill to audit component sizes, enforce single-responsibility principles, and isolate reusable domain utilities.

## Diagnostic Steps:
1. **Component Line Count Scan**:
   - Inspect files under `src/components/` and `src/app/`.
   - Identify any file exceeding 400 lines or containing mixed responsibilities (e.g. data fetching + heavy SVG rendering + complex form state).

2. **Decomposition Strategy**:
   - Extract domain subcomponents into dedicated subfolders (e.g., `src/components/task-manager/TaskCard.js`, `src/components/task-manager/TaskDetailDrawer.js`).
   - Extract pure helper functions and mathematical routines into `src/lib/` (e.g., `routineUtils.js`, `tagUtils.js`).

3. **Decoupling Verification**:
   - Ensure components accept props and callbacks rather than directly coupling to global store internals where modularity is preferred.
   - Verify that any newly created sub-module can be tested, replaced, or detached independently.
