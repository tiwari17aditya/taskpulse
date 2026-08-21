'use client';

import { useState } from 'react';
import { 
  Repeat, Clock, Calendar, Flame, CheckCircle2, Plus, Edit3, Trash2, 
  Sparkles, Tag, AlertCircle, Play, Pause, Check, X, ChevronRight, BarChart2, Hash, Archive
} from 'lucide-react';

import { deleteRoutineFromDB } from '@/lib/dbAdapter';

const WEEKDAYS = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
];

export default function RoutineManager({
  routines,
  setRoutines,
  tags,
  activeTag,
  setActiveTag,
  activeProfile,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'

  // Form State
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [interval, setInterval] = useState(1);
  const [targetTime, setTargetTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState([1, 2, 5]); // Mon, Tue, Fri
  const [selectedTags, setSelectedTags] = useState([]);
  const [autoMyDay, setAutoMyDay] = useState(true);
  const [maxIterations, setMaxIterations] = useState('');

  // Inline Quick Time Edit State
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [tempTime, setTempTime] = useState('');

  // Helper: Open Modal for Create or Edit
  const handleOpenCreate = () => {
    setEditingRoutine(null);
    setTitle('');
    setNotes('');
    setFrequency('weekly');
    setInterval(1);
    setTargetTime('08:00');
    setSelectedDays([1, 2, 5]);
    setSelectedTags([]);
    setAutoMyDay(true);
    setMaxIterations('');
    setShowModal(true);
  };

  const handleOpenEdit = (routine) => {
    setEditingRoutine(routine);
    setTitle(routine.title);
    setNotes(routine.notes || '');
    setFrequency(routine.frequency || 'weekly');
    setInterval(routine.interval || 1);
    setTargetTime(routine.targetTime || '08:00');
    setSelectedDays(routine.selectedDays || [1, 2, 5]);
    setSelectedTags(routine.tags || []);
    setAutoMyDay(routine.autoMyDay !== false);
    setMaxIterations(routine.maxIterations || '');
    setShowModal(true);
  };

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    if (newFreq === 'daily') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    else if (newFreq === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
    else if (newFreq === 'weekly') setSelectedDays([1, 2, 5]);
    else if (newFreq === 'monthly') setSelectedDays([1]);
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // Submit Routine (Create / Update)
  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingRoutine) {
      const updated = routines.map(r => {
        if (r.id === editingRoutine.id) {
          return {
            ...r,
            title: title.trim(),
            notes: notes.trim(),
            frequency,
            interval: Math.max(1, Number(interval) || 1),
            targetTime,
            selectedDays,
            tags: selectedTags,
            autoMyDay,
            maxIterations: maxIterations ? Number(maxIterations) : null,
          };
        }
        return r;
      });
      setRoutines(updated);
    } else {
      const newRoutine = {
        id: 'r-' + Date.now(),
        profileId: activeProfile?.id || 'p-aditya',
        title: title.trim(),
        notes: notes.trim(),
        frequency,
        interval: Math.max(1, Number(interval) || 1),
        targetTime,
        selectedDays,
        tags: selectedTags,
        autoMyDay,
        maxIterations: maxIterations ? Number(maxIterations) : null,
        createdAt: new Date().toISOString(),
        logs: [],
        streak: 0,
        paused: false,
        isArchived: false,
      };
      setRoutines([newRoutine, ...routines]);
    }

    setShowModal(false);
  };

  // Inline Quick Time Update
  const handleSaveInlineTime = (routineId) => {
    if (!tempTime) return setEditingTimeId(null);
    const updated = routines.map(r => {
      if (r.id === routineId) {
        return { ...r, targetTime: tempTime };
      }
      return r;
    });
    setRoutines(updated);
    setEditingTimeId(null);
  };

  const handleTogglePause = (routineId) => {
    const updated = routines.map(r => {
      if (r.id === routineId) {
        return { ...r, paused: !r.paused };
      }
      return r;
    });
    setRoutines(updated);
  };

  const handleDeleteRoutine = (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      const updated = routines.filter(r => r.id !== routineId);
      setRoutines(updated);
      deleteRoutineFromDB(routineId);
    }
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '08:00 AM';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDay = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
      days.push({ dateStr, shortDay });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Extract all unique tags present across routines (routine-specific tags)
  const routineTags = Array.from(new Set(
    routines.flatMap(r => r.tags || []).filter(Boolean)
  )).map(tagName => {
    const tagDef = tags?.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    const count = routines.filter(r => (r.tags || []).includes(tagName)).length;
    return {
      name: tagName,
      color: tagDef?.color || '#6366f1',
      count
    };
  });

  // Filter routines by active vs archived AND active tag
  const baseRoutines = activeTab === 'active' 
    ? routines.filter(r => !r.isArchived)
    : routines.filter(r => r.isArchived);

  const displayedRoutines = activeTag
    ? baseRoutines.filter(r => (r.tags || []).includes(activeTag))
    : baseRoutines;

  const activeRoutinesCount = routines.filter(r => !r.isArchived).length;
  const archivedRoutinesCount = routines.filter(r => r.isArchived).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Repeat className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Habits & Recurring Routines
            </h2>
            <p className="text-xs text-slate-400">
              Schedule routines with custom intervals, weekdays, and max iteration limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active / Archived Tab Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeRoutinesCount})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'archived' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" /> Archived ({archivedRoutinesCount})
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Routine
          </button>
        </div>
      </div>

      {/* Routine Tag Filter Toolbar */}
      {routineTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Filter by Routine Tag:
            </span>

            {/* All Routines Button */}
            <button
              onClick={() => setActiveTag && setActiveTag(null)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                !activeTag
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>All Routines</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${!activeTag ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {baseRoutines.length}
              </span>
            </button>

            {/* Individual Routine Tag Badges */}
            {routineTags.map(tag => {
              const isSelected = activeTag === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => setActiveTag && setActiveTag(isSelected ? null : tag.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-200 shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                  <span>#{tag.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-400">
                    {tag.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTag && (
            <button
              onClick={() => setActiveTag && setActiveTag(null)}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <span>✕ Clear Tag Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Routine Cards Grid */}
      {displayedRoutines.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/60 rounded-2xl space-y-3">
          <Repeat className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            {activeTab === 'archived' ? 'No Archived Routines' : 'No Active Routines Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'archived'
              ? 'Routines that reach their maximum iteration limit will automatically appear here.'
              : 'Create repeating routines to automatically populate tasks into your daily schedule.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedRoutines.map((routine) => {
            const isEditingTime = editingTimeId === routine.id;
            const streak = routine.streak || 0;
            const completedTotal = (routine.logs || []).length;
            const isIterationMaxed = routine.maxIterations && completedTotal >= Number(routine.maxIterations);

            return (
              <div
                key={routine.id}
                className={`bg-slate-900 border ${
                  routine.isArchived
                    ? 'border-amber-500/30 bg-slate-900/70'
                    : routine.paused
                    ? 'border-slate-800/60 opacity-60'
                    : 'border-slate-800 hover:border-slate-700'
                } rounded-2xl p-5 shadow-lg space-y-4 transition flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Title & Actions Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-bold ${routine.paused ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {routine.title}
                        </h3>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
                          {routine.frequency} {routine.interval > 1 ? `(Every ${routine.interval})` : ''}
                        </span>
                        {routine.isArchived && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                            Archived (Max Iterations Done)
                          </span>
                        )}
                        {routine.paused && !routine.isArchived && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
                            Paused
                          </span>
                        )}
                      </div>
                      {routine.notes && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {routine.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePause(routine.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          routine.paused
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400'
                        }`}
                        title={routine.paused ? 'Resume Routine' : 'Pause Routine'}
                      >
                        {routine.paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(routine)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                        title="Edit Routine"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Target Time & Days Pills */}
                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {isEditingTime ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={tempTime}
                            onChange={(e) => setTempTime(e.target.value)}
                            className="bg-slate-900 border border-indigo-500 text-xs text-slate-100 rounded px-1 py-0.5 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlineTime(routine.id)}
                            className="p-0.5 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTimeId(null)}
                            className="p-0.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingTimeId(routine.id); setTempTime(routine.targetTime || '08:00'); }}
                          className="font-mono text-slate-200 font-semibold hover:text-indigo-400 transition flex items-center gap-1 cursor-pointer"
                          title="Click to edit Target Time"
                        >
                          <span>{formatTimeDisplay(routine.targetTime)}</span>
                          <Edit3 className="w-3 h-3 opacity-40 hover:opacity-100" />
                        </button>
                      )}
                    </div>

                    {/* Active Days Summary */}
                    <div className="flex items-center gap-1">
                      {WEEKDAYS.map(day => {
                        const isSelected = (routine.selectedDays || []).includes(day.id);
                        return (
                          <span
                            key={day.id}
                            className={`w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-950 border border-slate-800 text-slate-600'
                            }`}
                          >
                            {day.short}
                          </span>
                        );
                      })}
                    </div>

                    {/* Iteration count progress */}
                    {routine.maxIterations && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-amber-300 font-bold">
                        {completedTotal} / {routine.maxIterations} iterations
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {routine.tags && routine.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {routine.tags.map(t => {
                        const isTagActive = activeTag === t;
                        const tagDef = tags?.find(tag => tag.name.toLowerCase() === t.toLowerCase());
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setActiveTag && setActiveTag(isTagActive ? null : t)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                              isTagActive
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold ring-1 ring-indigo-500'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                            title={`Filter routines by #${t}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagDef?.color || '#6366f1' }}></span>
                            <span>#{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Analytics & 7-Day Activity Matrix */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      <span>{streak} {streak === 1 ? 'Day Streak' : 'Days Streak'} 🔥</span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Completed: <strong className="text-slate-200">{completedTotal}</strong> times
                    </span>
                  </div>

                  {/* 7-Day Matrix */}
                  <div className="flex items-center justify-between gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-medium px-1">Last 7 Days:</span>
                    <div className="flex items-center gap-1.5">
                      {last7Days.map(day => {
                        const isCompleted = (routine.logs || []).includes(day.dateStr);
                        return (
                          <div
                            key={day.dateStr}
                            className={`w-7 h-7 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border transition ${
                              isCompleted
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-slate-900/60 border-slate-800/60 text-slate-600'
                            }`}
                            title={`${day.dateStr}: ${isCompleted ? 'Completed ✓' : 'Incomplete'}`}
                          >
                            <span>{day.shortDay}</span>
                            <span>{isCompleted ? '✓' : '•'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Repeat className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {editingRoutine ? 'Edit Routine Task' : 'Configure New Habit Routine'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Routine Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Meditation & Workout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-100 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Frequency & Interval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500"
                  >
                    <option value="daily">Everyday (Daily)</option>
                    <option value="weekdays">Weekdays Only (Mon-Fri)</option>
                    <option value="weekly">Weekly (Selected Days)</option>
                    <option value="monthly">Monthly (Specific Day)</option>
                    <option value="yearly">Yearly (Annual)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Recur Every (Interval)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={interval}
                      onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold text-center"
                    />
                    <span className="text-xs text-slate-400 font-semibold uppercase">
                      {frequency === 'daily' ? (interval > 1 ? 'Days' : 'Day') :
                       frequency === 'weekly' ? (interval > 1 ? 'Weeks' : 'Week') :
                       frequency === 'monthly' ? (interval > 1 ? 'Months' : 'Month') : (interval > 1 ? 'Years' : 'Year')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Time & Max Iterations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Target Time</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </label>
                  <input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Max Iterations (Optional)</span>
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Scheduled Days for Weekly */}
              {frequency === 'weekly' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Scheduled Weekdays ({selectedDays.length} days selected in interval week):
                  </label>
                  <div className="grid grid-cols-7 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    {WEEKDAYS.map(day => {
                      const isSelected = selectedDays.includes(day.id);
                      return (
                        <button
                          type="button"
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Routine Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Instructions or tips for this routine..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Tags</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tags.map(tag => {
                      const isSelected = selectedTags.includes(tag.name);
                      return (
                        <button
                          type="button"
                          key={tag.id}
                          onClick={() => toggleTag(tag.name)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          #{tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Auto My Day Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Auto-Populate to "My Day"</span>
                  <span className="text-[10px] text-slate-400 block">Automatically add to today's tasks when due.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoMyDay(!autoMyDay)}
                  className={`w-11 h-6 rounded-full transition p-1 flex items-center cursor-pointer ${
                    autoMyDay ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-2">
                {editingRoutine ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteRoutine(editingRoutine.id);
                      setShowModal(false);
                    }}
                    className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Routine
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {editingRoutine ? 'Save Routine Changes' : 'Create Routine Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
