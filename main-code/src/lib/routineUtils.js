/**
 * Routine & Habit Domain Calculation Utilities
 * Supports One-Time (default), Daily, Weekly (multi-day selection), Monthly, Yearly,
 * Custom N-Intervals (e.g. every 2 weeks on Mon/Fri), and Max Iteration Limits with Auto-Archive.
 */

import { storage } from './storage';
import { getTodayStr } from './dateUtils';

/**
 * Calculates current streak based on sorted completion logs
 */
export function calculateRoutineStreak(logs = []) {
  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  const sortedLogs = [...new Set(logs)].sort().reverse();
  if (sortedLogs.length === 0) return 0;

  const today = new Date();
  let checkDate = new Date(today);
  let todayStr = checkDate.toISOString().split('T')[0];

  // If not completed today yet, check starting from yesterday
  if (!sortedLogs.includes(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    todayStr = checkDate.toISOString().split('T')[0];
  }

  while (sortedLogs.includes(todayStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    todayStr = checkDate.toISOString().split('T')[0];
  }

  return streak;
}

/**
 * Updates a routine's daily completion log, checks maxIterations, and archives/pauses if limit reached
 */
export function updateRoutineCompletionLog(routines = [], routineId, taskCompleted, completionDate) {
  const targetDate = completionDate || getTodayStr();
  return routines.map(r => {
    if (r.id === routineId) {
      let logs = r.logs || [];
      if (taskCompleted) {
        if (!logs.includes(targetDate)) {
          logs = [...logs, targetDate].sort();
        }
      } else {
        logs = logs.filter(d => d !== targetDate);
      }
      const streak = calculateRoutineStreak(logs);
      const completionCount = logs.length;
      
      // Auto-archive & pause when maxIterations is reached
      let isArchived = r.isArchived || false;
      let paused = r.paused || false;

      if (r.maxIterations && Number(r.maxIterations) > 0) {
        if (completionCount >= Number(r.maxIterations)) {
          isArchived = true;
          paused = true;
        }
      }

      return { ...r, logs, streak, isArchived, paused };
    }
    return r;
  });
}

/**
 * Evaluates routine rules and generates daily routine tasks into My Day
 */
export function evaluateRoutineAutoPopulate(currentTasks = [], currentRoutines = [], activeProfileId = null) {
  const today = new Date();
  const todayStr = getTodayStr();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  const currentMonth = today.getMonth();

  let hasChanges = false;
  let updatedTasks = currentTasks.map(task => {
    // "My Day" strictly corresponds to current day: evict incomplete previous day items
    if (task.myDay && !task.completed) {
      const taskDate = task.myDayDate || task.routineDate || (task.createdAt ? task.createdAt.split('T')[0] : '');
      if (taskDate && taskDate < todayStr) {
        hasChanges = true;
        return { ...task, myDay: false };
      }
    }
    return task;
  });

  if (!currentRoutines || currentRoutines.length === 0) {
    if (hasChanges) storage.saveTasks(updatedTasks);
    return updatedTasks;
  }

  currentRoutines.forEach(routine => {
    if (routine.paused || routine.isArchived) return;
    if (routine.profileId && activeProfileId && routine.profileId !== activeProfileId) return;
    if (routine.autoMyDay === false) return;

    // Check if iteration limit is already exceeded
    const completedCount = (routine.logs || []).length;
    if (routine.maxIterations && Number(routine.maxIterations) > 0 && completedCount >= Number(routine.maxIterations)) {
      return;
    }

    let isDueToday = false;
    const freq = routine.frequency || 'daily';
    const interval = Math.max(1, Number(routine.interval) || 1);
    const days = routine.selectedDays || [0, 1, 2, 3, 4, 5, 6];

    // Reference start date for interval calculations
    const startDate = routine.startDate ? new Date(routine.startDate) : new Date(routine.createdAt || Date.now());
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.max(0, Math.floor((currentDay - startDay) / 86400000));
    const diffWeeks = Math.max(0, Math.floor(diffDays / 7));

    if (freq === 'daily') {
      isDueToday = (diffDays % interval) === 0;
    } else if (freq === 'weekdays') {
      isDueToday = dayOfWeek >= 1 && dayOfWeek <= 5;
    } else if (freq === 'weekly') {
      // Matches selected days in the active interval week (e.g. Mon, Tue, Fri = 3 days in that week)
      if (days.includes(dayOfWeek)) {
        isDueToday = (diffWeeks % interval) === 0;
      }
    } else if (freq === 'monthly') {
      const targetDay = routine.dayOfMonth || startDate.getDate();
      isDueToday = dayOfMonth === targetDay;
    } else if (freq === 'yearly') {
      const targetMonth = routine.monthOfYear !== undefined ? routine.monthOfYear : startDate.getMonth();
      const targetDay = routine.dayOfMonth || startDate.getDate();
      isDueToday = currentMonth === targetMonth && dayOfMonth === targetDay;
    }

    if (isDueToday) {
      const existing = updatedTasks.find(t =>
        (t.routineId === routine.id && t.routineDate === todayStr) ||
        (t.routineId === routine.id && t.dueDate === todayStr)
      );

      if (!existing) {
        const newTask = {
          id: `t-routine-${routine.id}-${todayStr}`,
          profileId: routine.profileId || activeProfileId || 'p-aditya',
          title: routine.title,
          completed: false,
          myDay: true,
          myDayDate: todayStr,
          starred: false,
          dueDate: todayStr,
          subtasks: [],
          tags: routine.tags || [],
          notes: routine.notes || '',
          createdAt: new Date().toISOString(),
          routineId: routine.id,
          routineDate: todayStr,
          routineTime: routine.targetTime || '08:00',
          maxIterations: routine.maxIterations || null,
          iterationNumber: completedCount + 1
        };
        updatedTasks.unshift(newTask);
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    storage.saveTasks(updatedTasks);
  }
  return updatedTasks;
}
