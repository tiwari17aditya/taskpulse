'use client';

import { useState } from 'react';
import { Plus, X, Sun, Star, Tag, Calendar, ChevronLeft, ChevronRight, Repeat, Hash } from 'lucide-react';
import { getTodayStr, getTomorrowStr, getNextWeekStr } from '@/lib/dateUtils';

const WEEKDAY_NAMES = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
];

export default function QuickAddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  tags = [],
  activeTag = null,
  activeProfile = null
}) {
  const [fabTaskTitle, setFabTaskTitle] = useState('');
  const [fabDueDate, setFabDueDate] = useState(getTodayStr());
  const [fabMyDay, setFabMyDay] = useState(false);
  const [fabStarred, setFabStarred] = useState(false);
  const [fabSelectedTags, setFabSelectedTags] = useState(activeTag ? [activeTag] : []);
  const [fabNotes, setFabNotes] = useState('');
  const [fabSubtasks, setFabSubtasks] = useState([]);
  const [fabSubtaskInput, setFabSubtaskInput] = useState('');
  const [showCalendarInFAB, setShowCalendarInFAB] = useState(false);
  const [fabCalMonth, setFabCalMonth] = useState(new Date().getMonth());
  const [fabCalYear, setFabCalYear] = useState(new Date().getFullYear());

  // Recurring / Repeating Schedule State (One-Time by Default)
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [frequency, setFrequency] = useState('weekly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [interval, setInterval] = useState(1); // e.g. every 1 week, every 2 weeks
  const [selectedDays, setSelectedDays] = useState([1, 2, 5]); // Default Mon, Tue, Fri
  const [maxIterations, setMaxIterations] = useState(''); // e.g. 20 times

  if (!isOpen) return null;

  const handleAddFabSubtask = (e) => {
    e.preventDefault();
    if (!fabSubtaskInput.trim()) return;
    setFabSubtasks([...fabSubtasks, { id: 'st-' + Date.now(), title: fabSubtaskInput.trim(), completed: false }]);
    setFabSubtaskInput('');
  };

  const handleRemoveFabSubtask = (id) => {
    setFabSubtasks(fabSubtasks.filter(st => st.id !== id));
  };

  const toggleFabTag = (tagName) => {
    if (fabSelectedTags.includes(tagName)) {
      setFabSelectedTags(fabSelectedTags.filter(t => t !== tagName));
    } else {
      setFabSelectedTags([...fabSelectedTags, tagName]);
    }
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!fabTaskTitle.trim()) return;

    const newTask = {
      id: 't-' + Date.now(),
      profileId: activeProfile?.id || 'p-aditya',
      title: fabTaskTitle.trim(),
      completed: false,
      myDay: fabMyDay,
      starred: fabStarred,
      dueDate: fabDueDate,
      subtasks: fabSubtasks,
      tags: fabSelectedTags.length > 0 ? fabSelectedTags : (activeTag ? [activeTag] : ['Work']),
      notes: fabNotes.trim(),
      media: [],
      createdAt: new Date().toISOString(),
      // Recurrence details if enabled
      isRecurring: enableSchedule,
      frequency: enableSchedule ? frequency : null,
      interval: enableSchedule ? (Number(interval) || 1) : 1,
      selectedDays: enableSchedule ? selectedDays : null,
      maxIterations: enableSchedule && maxIterations ? Number(maxIterations) : null,
      startDate: fabDueDate || getTodayStr(),
      logs: []
    };

    onSubmit(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Task Title *</label>
            <input
              type="text"
              autoFocus
              required
              placeholder="What needs to be done?"
              value={fabTaskTitle}
              onChange={(e) => setFabTaskTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 px-3.5 py-2.5 rounded-xl outline-none"
            />
          </div>

          {/* Due Date & Calendar Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date / Start Date (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowCalendarInFAB(!showCalendarInFAB)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3" />
                {showCalendarInFAB ? 'Hide Calendar' : 'Pick on Calendar'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => setFabDueDate(getTodayStr())}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  fabDueDate === getTodayStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setFabDueDate(getTomorrowStr())}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  fabDueDate === getTomorrowStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setFabDueDate(getNextWeekStr())}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  fabDueDate === getNextWeekStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Next Week
              </button>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                <span className="text-[10px] text-slate-500 font-medium">Date:</span>
                <input
                  type="date"
                  value={fabDueDate}
                  onChange={(e) => setFabDueDate(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs outline-none"
                />
              </div>

              {fabDueDate && (
                <button
                  type="button"
                  onClick={() => setFabDueDate('')}
                  className="text-[11px] text-rose-400 hover:underline ml-auto cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Embedded Calendar Grid */}
            {showCalendarInFAB && (
              <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (fabCalMonth === 0) { setFabCalMonth(11); setFabCalYear(y => y - 1); }
                      else setFabCalMonth(m => m - 1);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-200">
                    {['January','February','March','April','May','June','July','August','September','October','November','December'][fabCalMonth]} {fabCalYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (fabCalMonth === 11) { setFabCalMonth(0); setFabCalYear(y => y + 1); }
                      else setFabCalMonth(m => m + 1);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {WEEKDAY_NAMES.map(d => (
                    <span key={d.id} className="text-[10px] font-bold text-slate-500">{d.label.slice(0, 2)}</span>
                  ))}
                  {(() => {
                    const daysInM = new Date(fabCalYear, fabCalMonth + 1, 0).getDate();
                    const firstD = new Date(fabCalYear, fabCalMonth, 1).getDay();
                    const grid = [];
                    for (let i = 0; i < firstD; i++) grid.push(null);
                    for (let d = 1; d <= daysInM; d++) grid.push(d);

                    return grid.map((day, idx) => {
                      if (!day) return <div key={`fab-empty-${idx}`} />;
                      const pad = n => String(n).padStart(2, '0');
                      const dateStr = `${fabCalYear}-${pad(fabCalMonth + 1)}-${pad(day)}`;
                      const isSelected = fabDueDate === dateStr;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => { setFabDueDate(dateStr); setShowCalendarInFAB(false); }}
                          className={`py-1 rounded text-xs font-semibold transition cursor-pointer ${
                            isSelected ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-950 hover:bg-indigo-500/20 text-slate-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Repeat / Schedule Toggle Section (One-Time by Default) */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Repeat & Scheduling</span>
                  <span className="text-[10px] text-slate-500">{enableSchedule ? 'Recurring task enabled' : 'One-time task only (Default)'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnableSchedule(!enableSchedule)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  enableSchedule
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {enableSchedule ? 'Enabled ✓' : 'Enable Repeat'}
              </button>
            </div>

            {enableSchedule && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fade-in">
                {/* Frequency selector */}
                <div className="grid grid-cols-4 gap-1.5">
                  {['daily', 'weekly', 'monthly', 'yearly'].map((freqKey) => (
                    <button
                      key={freqKey}
                      type="button"
                      onClick={() => setFrequency(freqKey)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                        frequency === freqKey
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {freqKey}
                    </button>
                  ))}
                </div>

                {/* Interval selector (e.g. Every N weeks/days) */}
                <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-slate-300 font-medium">Recur every:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={interval}
                      onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 bg-slate-950 border border-slate-700 text-slate-100 text-center text-xs py-1 rounded-lg outline-none font-bold"
                    />
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">
                      {frequency === 'daily' ? (interval > 1 ? 'Days' : 'Day') :
                       frequency === 'weekly' ? (interval > 1 ? 'Weeks' : 'Week') :
                       frequency === 'monthly' ? (interval > 1 ? 'Months' : 'Month') : (interval > 1 ? 'Years' : 'Year')}
                    </span>
                  </div>
                </div>

                {/* Weekday checkboxes (Sun - Sat) for Weekly */}
                {frequency === 'weekly' && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Active on days of the week ({selectedDays.length} selected):
                    </span>
                    <div className="grid grid-cols-7 gap-1">
                      {WEEKDAY_NAMES.map((d) => {
                        const isDayActive = selectedDays.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDay(d.id)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                              isDayActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{d.short}</span>
                            <span className="text-[9px] opacity-75 font-normal">{d.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Iterations Limit Option */}
                <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">Max Iterations</span>
                      <span className="text-[10px] text-slate-500">Auto-archive & pause when reached</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={maxIterations}
                      onChange={(e) => setMaxIterations(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-700 text-slate-100 text-center text-xs py-1 rounded-lg outline-none font-medium placeholder:text-slate-600"
                    />
                    <span className="text-[11px] text-slate-400">times</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggles: My Day & Priority Star */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFabMyDay(!fabMyDay)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                fabMyDay
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-4 h-4" />
              {fabMyDay ? 'Added to My Day' : 'Add to My Day'}
            </button>

            <button
              type="button"
              onClick={() => setFabStarred(!fabStarred)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                fabStarred
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${fabStarred ? 'fill-amber-400' : ''}`} />
              {fabStarred ? 'Starred Priority' : 'Mark Important'}
            </button>
          </div>

          {/* Tags Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => {
                const isSelected = fabSelectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleFabTag(tag.name)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Notes & Details (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add extra context, links, or instructions..."
              value={fabNotes}
              onChange={(e) => setFabNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Sub-tasks Checklist (Optional)</label>
            {fabSubtasks.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {fabSubtasks.map(st => (
                  <div key={st.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950 text-xs text-slate-300">
                    <span>• {st.title}</span>
                    <button type="button" onClick={() => handleRemoveFabSubtask(st.id)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a step..."
                value={fabSubtaskInput}
                onChange={(e) => setFabSubtaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFabSubtask(e); } }}
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddFabSubtask}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg cursor-pointer"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fabTaskTitle.trim()}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-lg transition cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
