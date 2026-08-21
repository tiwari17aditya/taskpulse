---
name: routine-tracker-dev
description: Guidelines for managing RoutineManager, habit recurrence rules, streak tracking, and completion math.
---

# Routine & Habit Tracker Development Skill (`routine-tracker-dev`)

Governs development of the recurring routine builder, habit tracker, streaks, and progress calculations.

## Architectural Guidelines:
1. **Core State & Logic**:
   - `src/components/RoutineManager.js`: UI coordinator for habits and daily checklists.
   - `src/lib/routineUtils.js`: Pure mathematical and date functions (streak calculation, completion percentage, frequency matching).
2. **Frequency Types**:
   - `daily`, `weekdays`, `weekends`, `weekly`, `custom_days`.
3. **Data Serialization**:
   - Persists routine items with `id`, `title`, `frequency`, `timeOfDay`, `streak`, `history` (map of date strings to boolean), and `tags`.
