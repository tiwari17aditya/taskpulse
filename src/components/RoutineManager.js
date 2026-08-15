'use client';

import { useState } from 'react';
import { 
  Repeat, Clock, Calendar, Flame, CheckCircle2, Plus, Edit3, Trash2, 
  Sparkles, Tag, AlertCircle, Play, Pause, Check, X, ChevronRight, BarChart2
} from 'lucide-react';

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
  activeProfile,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [targetTime, setTargetTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [autoMyDay, setAutoMyDay] = useState(true);

  // Inline Quick Time Edit State
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [tempTime, setTempTime] = useState('');

  // Helper: Open Modal for Create or Edit
  const handleOpenCreate = () => {
    setEditingRoutine(null);
    setTitle('');
    setNotes('');
    setFrequency('daily');
    setTargetTime('08:00');
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    setSelectedTags([]);
    setAutoMyDay(true);
    setShowModal(true);
  };

  const handleOpenEdit = (routine) => {
    setEditingRoutine(routine);
    setTitle(routine.title);
    setNotes(routine.notes || '');
    setFrequency(routine.frequency || 'daily');
    setTargetTime(routine.targetTime || '08:00');
    setSelectedDays(routine.selectedDays || [0, 1, 2, 3, 4, 5, 6]);
    setSelectedTags(routine.tags || []);
    setAutoMyDay(routine.autoMyDay !== false);
    setShowModal(true);
  };

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    if (newFreq === 'daily') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    else if (newFreq === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
    else if (newFreq === 'weekly') setSelectedDays([1]); // Default Monday
    else if (newFreq === 'monthly') setSelectedDays([1]); // 1st of month
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
            targetTime,
            selectedDays,
            tags: selectedTags,
            autoMyDay,
          };
        }
        return r;
      });
      setRoutines(updated);
    } else {
      const newRoutine = {
        id: 'r-' + Date.now(),
        profileId: activeProfile?.id || 'p-1',
        title: title.trim(),
        notes: notes.trim(),
        frequency,
        targetTime,
        selectedDays,
        tags: selectedTags,
        autoMyDay,
        createdAt: new Date().toISOString(),
        logs: [],
        streak: 0,
        paused: false,
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

  // Toggle Pause/Resume
  const handleTogglePause = (routineId) => {
    const updated = routines.map(r => {
      if (r.id === routineId) {
        return { ...r, paused: !r.paused };
      }
      return r;
    });
    setRoutines(updated);
  };

  // Delete Routine
  const handleDeleteRoutine = (routineId) => {
    if (confirm('Are you sure you want to delete this routine? Past completion logs will be removed.')) {
      setRoutines(routines.filter(r => r.id !== routineId));
    }
  };

  // Calculate stats
  const totalRoutines = routines.length;
  const activeRoutines = routines.filter(r => !r.paused).length;
  const maxStreak = routines.reduce((max, r) => Math.max(max, r.streak || 0), 0);

  // Format 24h time to 12h display
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '08:00 AM';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  // Last 7 days helper for activity matrix
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = WEEKDAYS[d.getDay()].short;
      days.push({ dateStr, dayName, isToday: i === 0 });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Repeat className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-100">Daily & Recurring Routines</h1>
            </div>
            <p className="text-xs text-slate-400">
              Configure daily, weekly, or custom routines. Scheduled routines auto-populate into your <span className="text-amber-400 font-semibold">My Day</span> tasks with real-time streak tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Routine Task
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Total Routines</span>
              <span className="text-base font-bold text-slate-200">{totalRoutines}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Active Schedule</span>
              <span className="text-base font-bold text-emerald-400">{activeRoutines} Active</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Best Active Streak</span>
              <span className="text-base font-bold text-amber-400">{maxStreak} {maxStreak === 1 ? 'Day' : 'Days'} 🔥</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Auto My Day</span>
              <span className="text-base font-bold text-slate-200">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Cards List */}
      {routines.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Repeat className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No Routine Tasks Configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your daily habits, morning rituals, or weekly reports to auto-populate into your daily workspace.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create First Routine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map(routine => {
            const isEditingTime = editingTimeId === routine.id;
            const completedTotal = (routine.logs || []).length;
            const streak = routine.streak || 0;

            return (
              <div
                key={routine.id}
                className={`bg-slate-900 border ${
                  routine.paused ? 'border-slate-800/60 opacity-60' : 'border-slate-800 hover:border-slate-700'
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
                          {routine.frequency}
                        </span>
                        {routine.paused && (
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
                    {/* Editable Target Time Pill */}
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
                          title="Click to edit Target Time at any point of time"
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
                  </div>

                  {/* Tags */}
                  {routine.tags && routine.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {routine.tags.map(t => (
                        <span key={t} className="text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
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
                      Completed: <strong className="text-slate-200">{completedTotal}</strong> days
                    </span>
                  </div>

                  {/* 7-Day Matrix */}
                  <div className="flex items-center justify-between gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-medium px-1">Last 7 Days:</span>
                    <div className="flex items-center gap-1.5">
                      {last7Days.map(day => {
                        const isCompleted = (routine.logs || []).includes(day.dateStr);
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center gap-0.5">
                            <span className={`text-[9px] font-mono ${day.isToday ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                              {day.dayName}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                                isCompleted
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm'
                                  : day.isToday
                                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                  : 'bg-slate-900 border border-slate-800 text-slate-700'
                              }`}
                              title={`${day.dateStr}: ${isCompleted ? 'Completed' : 'Pending/Not logged'}`}
                            >
                              {isCompleted ? <Check className="w-3.5 h-3.5" /> : '•'}
                            </div>
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

      {/* Modal for Creating / Editing Routine Task */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editingRoutine ? 'Edit Routine Task' : 'Configure New Routine Task'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Routine Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning 20-Min Meditation & Workout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-100 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Frequency & Target Time */}
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
                    <option value="monthly">Monthly (1st of Month)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Target Time (Editable Anytime)</span>
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
              </div>

              {/* Selected Days (if weekly/daily/custom) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Scheduled Days</label>
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

              {/* Description / Notes */}
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

              {/* Tags Selection */}
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
