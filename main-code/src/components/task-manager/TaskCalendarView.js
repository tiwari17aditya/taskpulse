'use client';

import { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle2, 
  Circle, ListTodo, Sparkles, Filter, ChevronDown, ChevronUp,
  Clock, Repeat, Bell, ArrowRight
} from 'lucide-react';
import TaskCard from './TaskCard';
import { getLocalDateStr, getTodayStr, getTomorrowStr, getNextWeekStr, formatDisplayDate } from '@/lib/dateUtils';

export default function TaskCalendarView({
  tasks = [],
  reminders = [],
  routines = [],
  viewMode = 'planned', // 'planned' | 'history' | 'all'
  onSelectDay,
  selectedDay,
  onAddTaskOnDate,
  toggleTaskComplete,
  toggleStar,
  updateTaskDueDate,
  updateTaskTitle,
  selectedTask,
  setSelectedTask,
  tags = [],
  isSelectMode = false,
  selectedTaskIds = [],
  toggleSelectTask,
  activeProfile
}) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayCalStr = getTodayStr();

  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [focusedDay, setFocusedDay] = useState(selectedDay || todayCalStr);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [showCompletedOnDay, setShowCompletedOnDay] = useState(true);

  // 3-way view toggle: All | Regular Tasks | Routines
  const [calendarType, setCalendarType] = useState('all'); // 'all' | 'tasks' | 'routines'

  // Date Selection Mode: 'day' (single date) | 'range' (date interval)
  const [selectionMode, setSelectionMode] = useState('day'); 
  const [intervalPreset, setIntervalPreset] = useState('selected'); // 'selected' | 'today' | 'next7' | 'last7' | 'month' | 'custom'
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const activeSelectedDay = focusedDay || selectedDay || todayCalStr;

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);

  // 1. Group regular tasks by date
  const completedByDate = {};
  const dueByDate = {};
  tasks.forEach(t => {
    if (calendarType === 'routines' && !t.routineId) return;
    if (calendarType === 'tasks' && t.routineId) return;

    if (t.completed) {
      const dateKey = t.completedAt || (t.createdAt ? t.createdAt.split('T')[0] : '');
      if (dateKey) completedByDate[dateKey] = (completedByDate[dateKey] || 0) + 1;
    } else if (t.dueDate) {
      dueByDate[t.dueDate] = (dueByDate[t.dueDate] || 0) + 1;
    }
  });

  // 2. Group routine task logs by date
  const routineLogsByDate = {};
  routines.forEach(r => {
    (r.logs || []).forEach(logDate => {
      routineLogsByDate[logDate] = (routineLogsByDate[logDate] || 0) + 1;
    });
  });

  // 3. Group reminders by date
  const remindersByDate = {};
  reminders.forEach(r => {
    if (r.date) remindersByDate[r.date] = (remindersByDate[r.date] || 0) + 1;
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Handle Quick Add for Selected Day
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTaskOnDate?.(quickTaskTitle.trim(), activeSelectedDay);
    setQuickTaskTitle('');
  };

  // Determine date bounds for task filtering
  const isDateInRange = (dateToCheck) => {
    if (!dateToCheck) return false;
    
    if (selectionMode === 'day' || intervalPreset === 'selected') {
      return dateToCheck === activeSelectedDay;
    }
    if (intervalPreset === 'today') {
      return dateToCheck === todayCalStr;
    }
    if (intervalPreset === 'next7') {
      const next7Str = getLocalDateStr(new Date(Date.now() + 7 * 86400000));
      return dateToCheck >= todayCalStr && dateToCheck <= next7Str;
    }
    if (intervalPreset === 'last7') {
      const last7Str = getLocalDateStr(new Date(Date.now() - 6 * 86400000));
      return dateToCheck >= last7Str && dateToCheck <= todayCalStr;
    }
    if (intervalPreset === 'month') {
      const curMonthPrefix = `${calendarYear}-${pad(calendarMonth + 1)}`;
      return dateToCheck.startsWith(curMonthPrefix);
    }
    if (intervalPreset === 'custom') {
      if (customDateFrom && customDateTo) return dateToCheck >= customDateFrom && dateToCheck <= customDateTo;
      if (customDateFrom) return dateToCheck >= customDateFrom;
      if (customDateTo) return dateToCheck <= customDateTo;
      return true;
    }
    return dateToCheck === activeSelectedDay;
  };

  // Filter tasks for the selected day or interval
  const dayPlannedActiveTasks = tasks.filter(t => {
    if (calendarType === 'routines' && !t.routineId) return false;
    if (calendarType === 'tasks' && t.routineId) return false;
    if (t.completed) return false;
    return isDateInRange(t.dueDate);
  });

  const dayCompletedTasks = tasks.filter(t => {
    if (calendarType === 'routines' && !t.routineId) return false;
    if (calendarType === 'tasks' && t.routineId) return false;
    if (!t.completed) return false;
    const taskDate = t.completedAt || (t.createdAt ? t.createdAt.split('T')[0] : '');
    // In planned mode, also match if it was planned for this date
    if (viewMode === 'planned') {
      return isDateInRange(t.dueDate) || isDateInRange(taskDate);
    }
    return isDateInRange(taskDate);
  });

  const dayReminders = reminders.filter(r => isDateInRange(r.date));
  const dayRoutines = routines.filter(r => (r.logs || []).some(logDate => isDateInRange(logDate)));

  return (
    <div className="space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-1 touch-pan-y animate-fade-in">
      
      {/* Calendar Grid Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {viewMode === 'history' ? 'History & Completed Calendar' : 'Planned Tasks Calendar'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {viewMode === 'history' 
                ? 'Review completed accomplishments across selected dates & intervals'
                : 'Plan, schedule & instantly complete tasks for any day or date interval'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCalendarType('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                calendarType === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setCalendarType('tasks')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                calendarType === 'tasks' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📋 Tasks
            </button>
            <button
              type="button"
              onClick={() => setCalendarType('routines')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                calendarType === 'routines' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔁 Routines
            </button>
          </div>
        </div>

        {/* Date Filter Presets / Range Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => { setSelectionMode('day'); setIntervalPreset('selected'); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                selectionMode === 'day' && intervalPreset === 'selected'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              Selected Day ({formatDisplayDate(activeSelectedDay)})
            </button>

            <button
              type="button"
              onClick={() => { setSelectionMode('day'); setFocusedDay(todayCalStr); setIntervalPreset('today'); onSelectDay?.(todayCalStr); }}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                intervalPreset === 'today'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              Today
            </button>

            {viewMode === 'planned' ? (
              <button
                type="button"
                onClick={() => { setSelectionMode('range'); setIntervalPreset('next7'); }}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  selectionMode === 'range' && intervalPreset === 'next7'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                Next 7 Days
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setSelectionMode('range'); setIntervalPreset('last7'); }}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  selectionMode === 'range' && intervalPreset === 'last7'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                Last 7 Days
              </button>
            )}

            <button
              type="button"
              onClick={() => { setSelectionMode('range'); setIntervalPreset('month'); }}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                selectionMode === 'range' && intervalPreset === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Custom Date Interval */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>From:</span>
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => {
                setCustomDateFrom(e.target.value);
                setSelectionMode('range');
                setIntervalPreset('custom');
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] px-2 py-0.5 rounded-lg outline-none focus:border-indigo-500"
            />
            <span>To:</span>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => {
                setCustomDateTo(e.target.value);
                setSelectionMode('range');
                setIntervalPreset('custom');
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] px-2 py-0.5 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 flex items-center gap-1 text-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="text-center">
            <span className="text-base font-bold text-slate-100 tracking-wide block">
              {MONTH_NAMES[calendarMonth]} {calendarYear}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">
              Click any date to view and manage its tasks
            </span>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 flex items-center gap-1 text-xs cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day of week header */}
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-slate-500 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="min-h-[48px] rounded-xl bg-slate-950/20" />;
            const dateStr = `${calendarYear}-${pad(calendarMonth + 1)}-${pad(day)}`;
            const completedCount = completedByDate[dateStr] || 0;
            const dueCount = dueByDate[dateStr] || 0;
            const routineLogCount = routineLogsByDate[dateStr] || 0;
            const reminderCount = remindersByDate[dateStr] || 0;
            const isToday = dateStr === todayCalStr;
            const isSelected = dateStr === activeSelectedDay && (selectionMode === 'day' || intervalPreset === 'selected');

            return (
              <button
                key={dateStr}
                onClick={() => { 
                  setFocusedDay(dateStr); 
                  setSelectionMode('day');
                  setIntervalPreset('selected');
                  if (onSelectDay) onSelectDay(dateStr); 
                }}
                className={`relative flex flex-col items-center justify-between p-1.5 min-h-[54px] sm:min-h-[60px] rounded-xl text-xs font-semibold transition active:scale-95 border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50 scale-[1.02]'
                    : isToday
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20'
                    : (completedCount > 0 || dueCount > 0 || routineLogCount > 0 || reminderCount > 0)
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <span className="text-xs font-bold leading-none">{day}</span>

                {/* Numeric count item badges */}
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1 w-full">
                  {dueCount > 0 && (
                    <span
                      className={`px-1 py-0.2 text-[9px] font-bold rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                      title={`${dueCount} active due items`}
                    >
                      {dueCount}●
                    </span>
                  )}
                  {completedCount > 0 && (
                    <span
                      className={`px-1 py-0.2 text-[9px] font-bold rounded ${
                        isSelected ? 'bg-emerald-300/30 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                      title={`${completedCount} completed items`}
                    >
                      {completedCount}✓
                    </span>
                  )}
                  {routineLogCount > 0 && (
                    <span
                      className={`px-1 py-0.2 text-[9px] font-bold rounded ${
                        isSelected ? 'bg-amber-300/30 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                      title={`${routineLogCount} routine completions`}
                    >
                      {routineLogCount}🔁
                    </span>
                  )}
                  {reminderCount > 0 && (
                    <span
                      className={`px-1 py-0.2 text-[9px] font-bold rounded ${
                        isSelected ? 'bg-amber-200/30 text-white' : 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                      }`}
                      title={`${reminderCount} reminders`}
                    >
                      {reminderCount}🔔
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1.5"><span className="px-1 bg-indigo-500/20 text-indigo-300 rounded font-bold">X●</span> Active Due</span>
          <span className="flex items-center gap-1.5"><span className="px-1 bg-emerald-500/20 text-emerald-300 rounded font-bold">X✓</span> Completed</span>
          <span className="flex items-center gap-1.5"><span className="px-1 bg-amber-500/20 text-amber-300 rounded font-bold">X🔁</span> Routine Done</span>
          <span className="flex items-center gap-1.5"><span className="px-1 bg-amber-400/20 text-amber-200 rounded font-bold">X🔔</span> Reminders</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Selected Day / Date Interval Tasks Breakdown & Real-Time Action Section */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Agenda Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-400" />
              {selectionMode === 'day' || intervalPreset === 'selected'
                ? `Agenda for ${formatDisplayDate(activeSelectedDay)} (${activeSelectedDay})`
                : intervalPreset === 'next7'
                ? 'Agenda for Next 7 Days'
                : intervalPreset === 'last7'
                ? 'Accomplishments over Last 7 Days'
                : intervalPreset === 'month'
                ? `Agenda for ${MONTH_NAMES[calendarMonth]} ${calendarYear}`
                : `Agenda for Date Interval (${customDateFrom || 'Start'} → ${customDateTo || 'End'})`}
            </h3>
            <p className="text-[11px] text-slate-400">
              {viewMode === 'history'
                ? `${dayCompletedTasks.length} task(s) completed in this timeframe`
                : `${dayPlannedActiveTasks.length} planned task(s) due • ${dayCompletedTasks.length} completed`}
            </p>
          </div>

          {/* Quick inline Task Creator for the focused day (in planned/all mode) */}
          {viewMode !== 'history' && (
            <form onSubmit={handleQuickAdd} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder={`+ Add task for ${formatDisplayDate(activeSelectedDay)}...`}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl outline-none focus:border-indigo-500 flex-1 sm:w-64"
              />
              <button
                type="submit"
                disabled={!quickTaskTitle.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {/* 1. Planned / Active Tasks */}
          {dayPlannedActiveTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <span>📋 Active Due Tasks ({dayPlannedActiveTasks.length})</span>
                <span className="text-[10px] font-normal text-slate-500">Checking an item updates status & calendar live</span>
              </div>
              <div className="space-y-2">
                {dayPlannedActiveTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    toggleTaskComplete={toggleTaskComplete}
                    toggleStar={toggleStar}
                    updateTaskDueDate={updateTaskDueDate}
                    tags={tags}
                    getTodayStr={getTodayStr}
                    getTomorrowStr={getTomorrowStr}
                    getNextWeekStr={getNextWeekStr}
                    isSelectMode={isSelectMode}
                    isSelectedForBulk={selectedTaskIds.includes(task.id)}
                    toggleSelectTask={toggleSelectTask}
                    onRenameTask={updateTaskTitle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Completed Tasks on this Day/Interval */}
          {dayCompletedTasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowCompletedOnDay(!showCompletedOnDay)}
                className="flex items-center justify-between w-full px-1 text-xs font-bold text-emerald-400 uppercase tracking-wider hover:text-emerald-300 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Completed Items ({dayCompletedTasks.length})
                </span>
                {showCompletedOnDay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCompletedOnDay && (
                <div className="space-y-2 animate-fade-in">
                  {dayCompletedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      selectedTask={selectedTask}
                      setSelectedTask={setSelectedTask}
                      toggleTaskComplete={toggleTaskComplete}
                      toggleStar={toggleStar}
                      updateTaskDueDate={updateTaskDueDate}
                      tags={tags}
                      getTodayStr={getTodayStr}
                      getTomorrowStr={getTomorrowStr}
                      getNextWeekStr={getNextWeekStr}
                      isSelectMode={isSelectMode}
                      isSelectedForBulk={selectedTaskIds.includes(task.id)}
                      toggleSelectTask={toggleSelectTask}
                      onRenameTask={updateTaskTitle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Empty State if no tasks for this day */}
          {dayPlannedActiveTasks.length === 0 && dayCompletedTasks.length === 0 && (
            <div className="py-8 text-center bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-1">
              <p className="text-xs font-medium text-slate-400">
                {viewMode === 'history' 
                  ? 'No tasks completed on this date'
                  : 'No scheduled tasks for this date'}
              </p>
              <p className="text-[11px] text-slate-500">
                {viewMode === 'history'
                  ? 'Pick another date with green check badges (✓) to view past completions'
                  : 'Type a title above to schedule a new task for this day'}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
