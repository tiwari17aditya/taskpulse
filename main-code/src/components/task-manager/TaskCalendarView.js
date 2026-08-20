'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TaskCalendarView({
  tasks = [],
  reminders = [],
  routines = [],
  onSelectDay,
  selectedDay,
  onAddTaskOnDate
}) {
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [focusedDay, setFocusedDay] = useState(selectedDay || '');
  const [quickTitle, setQuickTitle] = useState('');

  // 3-way view toggle: All | Tasks | Routines
  const [calendarType, setCalendarType] = useState('all'); // 'all' | 'tasks' | 'routines'

  const pad = n => String(n).padStart(2, '0');
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const todayCalStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

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

  // Group regular tasks by date
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

  // Group routine task logs by date
  const routineLogsByDate = {};
  routines.forEach(r => {
    (r.logs || []).forEach(logDate => {
      routineLogsByDate[logDate] = (routineLogsByDate[logDate] || 0) + 1;
    });
  });

  const remindersByDate = {};
  reminders.forEach(r => {
    if (r.date) remindersByDate[r.date] = (remindersByDate[r.date] || 0) + 1;
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 touch-pan-y animate-fade-in">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Sub-Header & Separate Calendar Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Date-Based Calendar Activity
            </h2>
            <p className="text-[11px] text-slate-400">View tasks, completions & routine schedule by day</p>
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
              📋 Tasks Calendar
            </button>
            <button
              type="button"
              onClick={() => setCalendarType('routines')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                calendarType === 'routines' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔁 Routine Calendar
            </button>
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
              {calendarType === 'routines' ? '🔁 Dedicated Routine Tasks Calendar' : calendarType === 'tasks' ? '📋 Dedicated Regular Tasks Calendar' : 'Interactive Multi-View Calendar'}
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
            const isSelected = dateStr === activeSelectedDay;

            return (
              <button
                key={dateStr}
                onClick={() => { setFocusedDay(dateStr); if (onSelectDay) onSelectDay(dateStr); }}
                className={`relative flex flex-col items-center justify-between p-1.5 min-h-[54px] sm:min-h-[60px] rounded-xl text-xs font-semibold transition active:scale-95 border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
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
    </div>
  );
}
