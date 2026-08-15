'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Circle, Sun, Calendar, Plus, Trash2, Tag, ChevronRight, ChevronLeft, Check, X, ListTodo, Paperclip, Pencil, Bell, Clock, Sparkles, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';
import MediaUploader from './MediaUploader';
import { saveTaskToDB, deleteTaskFromDB, deleteTasksFromDB } from '@/lib/dbAdapter';

export default function TaskManager({
  tasks,
  setTasks,
  tags,
  currentFilter,
  activeTag,
  reminders = [],
  onOpenNotificationModal,
  activeProfile
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState('');

  // Bulk Multi-Select state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Helper date presets in local timezone
  const getLocalDateStr = (date = new Date()) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayStr = () => getLocalDateStr();
  const getTomorrowStr = () => getLocalDateStr(new Date(Date.now() + 86400000));
  const getNextWeekStr = () => getLocalDateStr(new Date(Date.now() + 7 * 86400000));
  const getYesterdayStr = () => getLocalDateStr(new Date(Date.now() - 86400000));

  const [showCompletedSection, setShowCompletedSection] = useState(false);
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'tomorrow', 'next-week', 'custom'
  const [customFilterDate, setCustomFilterDate] = useState('');

  // Sub-views for Planned & History tabs
  const [historySubView, setHistorySubView] = useState('list'); // 'list' | 'calendar'
  const [plannedSubView, setPlannedSubView] = useState('list'); // 'list' | 'calendar'
  const [historyPreset, setHistoryPreset] = useState('all'); // 'all' | 'today' | 'yesterday' | 'last7' | 'month' | 'custom'
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showCalendarFilters, setShowCalendarFilters] = useState(false);

  const addTaskOnDate = (title, dateStr) => {
    if (!title || !title.trim()) return;
    const newTask = {
      id: 't-' + Date.now(),
      profileId: activeProfile?.id || 'p-1',
      title: title.trim(),
      completed: false,
      myDay: dateStr === getTodayStr(),
      starred: false,
      dueDate: dateStr,
      subtasks: [],
      tags: activeTag ? [activeTag] : ['Work'],
      notes: '',
      media: [],
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    saveTaskToDB(newTask);
  };


  const updateTaskDueDate = (taskId, newDueDate) => {
    let targetTask = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        targetTask = { ...t, dueDate: newDueDate };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    if (targetTask) saveTaskToDB(targetTask);
    if (selectedTask?.id === taskId) setSelectedTask(targetTask);
  };

  const todayStr = getLocalDateStr();

  // Filter tasks according to selected view & date filter
  const categoryTasks = tasks.filter(task => {
    // 1. Tag Filter
    if (activeTag) {
      if (!task.tags || !task.tags.includes(activeTag)) return false;
    } else {
      // 2. Main Filter
      if (currentFilter === 'my-day' && !task.myDay) return false;
      if (currentFilter === 'important' && !task.starred) return false;
      if (currentFilter === 'planned' && !task.dueDate) return false;
      if (currentFilter === 'completed' && !task.completed) return false;
    }

    // 3. Checked tasks aging logic ("everyday checked tasks")
    if (task.completed) {
      if (currentFilter === 'completed') return true; // Always visible in History

      if (filterDate !== 'all') {
        // Specific day selected: show if completed on that day OR due on that day
        let targetFilterDate = '';
        if (filterDate === 'today') targetFilterDate = todayStr;
        else if (filterDate === 'tomorrow') targetFilterDate = getTomorrowStr();
        else if (filterDate === 'next-week') targetFilterDate = getNextWeekStr();
        else if (filterDate === 'custom') targetFilterDate = customFilterDate;

        const matchesDueDate = task.dueDate === targetFilterDate || 
          (filterDate === 'today' && task.dueDate === 'Today') || 
          (filterDate === 'tomorrow' && task.dueDate === 'Tomorrow') || 
          (filterDate === 'next-week' && task.dueDate === 'Next Week');

        const matchesCompletedDate = task.completedAt === targetFilterDate;

        return matchesDueDate || matchesCompletedDate;
      } else {
        // No specific day selected: only show if completed today
        const completedDate = task.completedAt || (task.createdAt ? task.createdAt.split('T')[0] : '');
        return completedDate === todayStr;
      }
    } else {
      // Active tasks: filter by date if filter active
      if (filterDate !== 'all') {
        if (filterDate === 'today') return task.dueDate === todayStr || task.dueDate === 'Today';
        if (filterDate === 'tomorrow') return task.dueDate === getTomorrowStr() || task.dueDate === 'Tomorrow';
        if (filterDate === 'next-week') return task.dueDate === getNextWeekStr() || task.dueDate === 'Next Week';
        if (filterDate === 'custom' && customFilterDate) return task.dueDate === customFilterDate;
        return false;
      }
    }

    return true; // All active tasks when filterDate is 'all'
  });

  const activeTasks = currentFilter === 'completed' ? [] : categoryTasks.filter(t => !t.completed);
  const completedTasks = currentFilter === 'completed' ? categoryTasks : categoryTasks.filter(t => t.completed);

  // History-specific filtering on top of completedTasks (Enhancement 12)
  const historyFilteredTasks = currentFilter === 'completed' ? (() => {
    if (historyPreset === 'all' && !historyDateFrom && !historyDateTo) return completedTasks;
    return completedTasks.filter(t => {
      const taskDate = t.completedAt || (t.createdAt ? t.createdAt.split('T')[0] : '');
      if (historyPreset === 'today') return taskDate === todayStr;
      if (historyPreset === 'yesterday') return taskDate === getYesterdayStr();
      if (historyPreset === 'last7') {
        const from = getLocalDateStr(new Date(Date.now() - 6 * 86400000));
        return taskDate >= from && taskDate <= todayStr;
      }
      if (historyPreset === 'month') return taskDate.startsWith(todayStr.slice(0, 7));
      if (historyPreset === 'custom') {
        if (historyDateFrom && historyDateTo) return taskDate >= historyDateFrom && taskDate <= historyDateTo;
        if (historyDateFrom) return taskDate >= historyDateFrom;
        if (historyDateTo) return taskDate <= historyDateTo;
        return true;
      }
      return true;
    });
  })() : completedTasks;

  const clearHistoryFilters = () => {
    setHistoryPreset('all');
    setHistoryDateFrom('');
    setHistoryDateTo('');
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const initialDueDate = selectedDueDate || (currentFilter === 'planned' ? getTodayStr() : '');

    const newTask = {
      id: 't-' + Date.now(),
      profileId: activeProfile?.id || 'p-aditya',
      title: newTaskTitle.trim(),
      completed: false,
      myDay: currentFilter === 'my-day',
      starred: currentFilter === 'important',
      dueDate: initialDueDate,
      subtasks: [],
      tags: activeTag ? [activeTag] : ['Work'],
      notes: '',
      media: [],
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    saveTaskToDB(newTask); // Direct sync to NeonDB / active database
    setNewTaskTitle('');
    setSelectedDueDate('');
  };

  // Enhancement 13 — update task title and sync to DB
  const updateTaskTitle = (taskId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    let targetTask = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        targetTask = { ...t, title: newTitle.trim() };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    if (targetTask) saveTaskToDB(targetTask);
    if (selectedTask?.id === taskId) setSelectedTask(targetTask);
  };

  const toggleTaskComplete = (taskId) => {
    let targetTask = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
        targetTask = { 
          ...t, 
          completed: isNowCompleted,
          completedAt: isNowCompleted ? getLocalDateStr() : null 
        };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    if (targetTask) saveTaskToDB(targetTask); // Direct sync to NeonDB
    if (selectedTask?.id === taskId) {
      setSelectedTask(updated.find(t => t.id === taskId));
    }
  };

  const toggleStar = (taskId, e) => {
    e?.stopPropagation();
    let targetTask = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        targetTask = { ...t, starred: !t.starred };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    if (targetTask) saveTaskToDB(targetTask);
    if (selectedTask?.id === taskId) setSelectedTask(updated.find(t => t.id === taskId));
  };

  const toggleMyDay = (taskId, e) => {
    e?.stopPropagation();
    let targetTask = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        targetTask = { ...t, myDay: !t.myDay };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    if (targetTask) saveTaskToDB(targetTask);
    if (selectedTask?.id === taskId) setSelectedTask(updated.find(t => t.id === taskId));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    deleteTaskFromDB(taskId); // Direct sync delete to NeonDB
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const toggleSelectTask = (taskId, e) => {
    e?.stopPropagation();
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const selectAllCategoryTasks = () => {
    const allIds = categoryTasks.map(t => t.id);
    setSelectedTaskIds(allIds);
  };

  const deselectAllTasks = () => {
    setSelectedTaskIds([]);
  };

  const deleteSelectedTasks = () => {
    if (selectedTaskIds.length === 0) return;
    const remaining = tasks.filter(t => !selectedTaskIds.includes(t.id));
    setTasks(remaining);
    deleteTasksFromDB(selectedTaskIds);
    setSelectedTaskIds([]);
    if (selectedTask && selectedTaskIds.includes(selectedTask.id)) {
      setSelectedTask(null);
    }
  };

  const deleteAllCategoryTasks = () => {
    const targetIds = categoryTasks.map(t => t.id);
    if (targetIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${targetIds.length} tasks in this view?`)) return;
    const remaining = tasks.filter(t => !targetIds.includes(t.id));
    setTasks(remaining);
    deleteTasksFromDB(targetIds);
    setSelectedTaskIds([]);
    if (selectedTask && targetIds.includes(selectedTask.id)) {
      setSelectedTask(null);
    }
  };

  const addSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTask) return;

    const newSubtask = {
      id: 'st-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const updatedTask = {
      ...selectedTask,
      subtasks: [...(selectedTask.subtasks || []), newSubtask]
    };

    const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    saveTaskToDB(updatedTask);
    setSelectedTask(updatedTask);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId) => {
    if (!selectedTask) return;
    const updatedSubtasks = selectedTask.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const updatedTask = { ...selectedTask, subtasks: updatedSubtasks };
    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    saveTaskToDB(updatedTask);
    setSelectedTask(updatedTask);
  };

  const updateTaskNotes = (notes) => {
    if (!selectedTask) return;
    const updatedTask = { ...selectedTask, notes };
    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    saveTaskToDB(updatedTask);
    setSelectedTask(updatedTask);
  };

  const toggleTaskTag = (tagName) => {
    if (!selectedTask) return;
    const currentTags = selectedTask.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];

    const updatedTask = { ...selectedTask, tags: newTags };
    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    saveTaskToDB(updatedTask);
    setSelectedTask(updatedTask);
  };

  const isCalendarMode = (currentFilter === 'planned' && plannedSubView === 'calendar') || (currentFilter === 'completed' && historySubView === 'calendar');

  return (
    <div className="flex gap-6 h-full relative">
      {/* Main Task List Column */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Calendar Mode Compact Header Toggle */}
        {isCalendarMode && (
          <div className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs shadow-md">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-100">Full-Screen Interactive Calendar</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCalendarFilters(!showCalendarFilters)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {showCalendarFilters ? 'Collapse Toolbars' : 'Expand Filters & Toolbars'}
            </button>
          </div>
        )}

        {/* Quick Add Task Bar & Date Presets (Collapsed in Calendar Mode unless expanded) */}
        {(!isCalendarMode || showCalendarFilters) && (
          <form onSubmit={addTask} className="space-y-2">
            <div className="flex items-center bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-4 py-3 shadow-lg transition">
              <Plus className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Add a task (e.g. 'Review weekly plan')..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-transparent text-sm text-slate-100 placeholder-slate-500 w-full outline-none"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition"
              >
                Add
              </button>
            </div>

            {/* Due Date Presets Bar */}
            <div className="flex items-center gap-1.5 px-1 overflow-x-auto text-xs">
              <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" /> Due Date:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDueDate(getTodayStr())}
                className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
                  selectedDueDate === getTodayStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDueDate(getTomorrowStr())}
                className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
                  selectedDueDate === getTomorrowStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setSelectedDueDate(getNextWeekStr())}
                className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
                  selectedDueDate === getNextWeekStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Next Week
              </button>
              <input
                type="date"
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-full outline-none"
              />
              {selectedDueDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDueDate('')}
                  className="text-slate-500 hover:text-rose-400 text-[11px] ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        )}

        {/* Date Filter & Multi-Select Toolbars (Collapsed in Calendar Mode unless expanded) */}
        {(!isCalendarMode || showCalendarFilters) && (
          <>
            {/* Date Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filter by Date:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setFilterDate('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    filterDate === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Dates
                </button>
                <button
                  onClick={() => setFilterDate('today')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    filterDate === 'today' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setFilterDate('tomorrow')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    filterDate === 'tomorrow' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setFilterDate('next-week')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    filterDate === 'next-week' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Next Week
                </button>
                <input
                  type="date"
                  value={customFilterDate}
                  onChange={(e) => {
                    setCustomFilterDate(e.target.value);
                    setFilterDate(e.target.value ? 'custom' : 'all');
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* Bulk Selection & Multi-Delete Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    if (isSelectMode) setSelectedTaskIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isSelectMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSelectMode ? 'Exit Selection Mode' : 'Multi-Select Tasks'}
                </button>

                {isSelectMode && (
                  <>
                    <button
                      type="button"
                      onClick={selectedTaskIds.length === categoryTasks.length ? deselectAllTasks : selectAllCategoryTasks}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                    >
                      {selectedTaskIds.length === categoryTasks.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedTaskIds.length} of {categoryTasks.length} selected
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isSelectMode && selectedTaskIds.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteSelectedTasks}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedTaskIds.length})
                  </button>
                )}
                {categoryTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAllCategoryTasks}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All Tasks ({categoryTasks.length})
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Planned View Controls (Sub-tabs: List / Calendar) */}
        {currentFilter === 'planned' && (
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setPlannedSubView('list')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                plannedSubView === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" /> List View
            </button>
            <button
              onClick={() => setPlannedSubView('calendar')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                plannedSubView === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar View
            </button>
          </div>
        )}

        {/* History Controls (sub-tabs + date filter), in Completed view */}
        {currentFilter === 'completed' && (
          <div className="space-y-3">
            {/* Sub-tabs: List / Calendar */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => setHistorySubView('list')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  historySubView === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" /> List View
              </button>
              <button
                onClick={() => setHistorySubView('calendar')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  historySubView === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Calendar View
              </button>
            </div>

            {/* History Date Filter Toolbar (Collapsed in Calendar Mode unless expanded) */}
            {(!isCalendarMode || showCalendarFilters) && (
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Filter History
                  </span>
                  {(historyPreset !== 'all' || historyDateFrom || historyDateTo) && (
                    <button
                      onClick={clearHistoryFilters}
                      className="text-[11px] text-rose-400 hover:text-rose-300 transition font-medium"
                    >
                      ✕ Clear Filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: 'Today' },
                  { key: 'yesterday', label: 'Yesterday' },
                  { key: 'last7', label: 'Last 7 Days' },
                  { key: 'month', label: 'This Month' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setHistoryPreset(key); setHistoryDateFrom(''); setHistoryDateTo(''); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      historyPreset === key && !historyDateFrom && !historyDateTo
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-slate-800">
                <span className="font-medium text-slate-500">From:</span>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => { setHistoryDateFrom(e.target.value); setHistoryPreset('custom'); }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-lg outline-none focus:border-indigo-500 transition"
                />
                <span className="font-medium text-slate-500">To:</span>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => { setHistoryDateTo(e.target.value); setHistoryPreset('custom'); }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-lg outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
            )}
          </div>
        )}

        {/* Calendar View — visible when Calendar sub-tab is selected in History OR Planned view */}
        {((currentFilter === 'completed' && historySubView === 'calendar') ||
          (currentFilter === 'planned' && plannedSubView === 'calendar')) && (
          <HistoryCalendar
            tasks={tasks}
            reminders={reminders}
            onAddTaskOnDate={addTaskOnDate}
            onSelectDay={(dateStr) => {
              if (currentFilter === 'completed') {
                setHistoryDateFrom(dateStr);
                setHistoryDateTo(dateStr);
                setHistoryPreset('custom');
                setHistorySubView('list');
              }
            }}
            selectedDay={historyPreset === 'custom' && historyDateFrom === historyDateTo ? historyDateFrom : ''}
          />
        )}

        {/* Tasks List Container */}
        {((currentFilter !== 'completed' || historySubView === 'list') &&
          (currentFilter !== 'planned' || plannedSubView === 'list')) && (
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-240px)] pr-1 touch-pan-y">

          {/* 1. Active Tasks Section */}
          {activeTasks.length === 0 && historyFilteredTasks.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-xl">
              <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">
                {currentFilter === 'completed'
                  ? (historyPreset !== 'all' || historyDateFrom || historyDateTo)
                    ? 'No tasks completed in this period'
                    : 'No completed tasks yet'
                  : 'No active tasks in this view'}
              </p>
              <p className="text-xs text-slate-500">
                {currentFilter === 'completed'
                  ? 'Try a different date range or clear filters'
                  : 'Type above to create your first item'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTasks.map((task) => (
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

          {/* 2. Completed / History Tasks Section */}
          {historyFilteredTasks.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowCompletedSection(!showCompletedSection)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider flex items-center gap-2 py-1"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed Items ({historyFilteredTasks.length})</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">({showCompletedSection ? 'Hide' : 'Show'})</span>
              </button>

              {showCompletedSection && (
                <div className="space-y-2">
                  {historyFilteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      selectedTask={selectedTask}
                      setSelectedTask={setSelectedTask}
                      toggleTaskComplete={toggleTaskComplete}
                      toggleStar={toggleStar}
                      tags={tags}
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
        </div>
        )}
      </div>

      {/* Task Detail Drawer (MS To-Do Style Slide-Over Panel) */}
      {selectedTask && (
        <div className="fixed inset-0 z-40 lg:relative lg:inset-auto bg-slate-950/80 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent flex justify-end lg:block p-3 lg:p-0">
          <div className="w-full max-w-md lg:w-80 xl:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4 animate-fade-in shrink-0 h-full max-h-[85vh] lg:max-h-none overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleTaskComplete(selectedTask.id)}>
                  {selectedTask.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <h3 className={`text-base font-semibold ${selectedTask.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                  {selectedTask.title}
                </h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions (My Day & Priority) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => toggleMyDay(selectedTask.id, e)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                  selectedTask.myDay
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                {selectedTask.myDay ? 'In My Day' : 'Add to My Day'}
              </button>

              <button
                onClick={(e) => toggleStar(selectedTask.id, e)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                  selectedTask.starred
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${selectedTask.starred ? 'fill-amber-400' : ''}`} />
                {selectedTask.starred ? 'Starred' : 'Star Task'}
              </button>
            </div>

            {/* Due Date Selector Block */}
            <div className="space-y-1.5 border-t border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Due Date</span>
                {selectedTask.dueDate && (
                  <button onClick={() => updateTaskDueDate(selectedTask.id, '')} className="text-[10px] text-rose-400 hover:underline">
                    Clear Date
                  </button>
                )}
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => updateTaskDueDate(selectedTask.id, getTodayStr())}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    selectedTask.dueDate === getTodayStr() || selectedTask.dueDate === 'Today'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => updateTaskDueDate(selectedTask.id, getTomorrowStr())}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    selectedTask.dueDate === getTomorrowStr() || selectedTask.dueDate === 'Tomorrow'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => updateTaskDueDate(selectedTask.id, getNextWeekStr())}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    selectedTask.dueDate === getNextWeekStr() || selectedTask.dueDate === 'Next Week'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Next Week
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Custom Date:</span>
                <input
                  type="date"
                  value={selectedTask.dueDate || ''}
                  onChange={(e) => updateTaskDueDate(selectedTask.id, e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2.5 py-1 rounded-lg outline-none focus:border-indigo-500 flex-1"
                />
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sub-tasks Checklist</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedTask.subtasks?.map(st => (
                  <div key={st.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 text-xs">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSubtask(st.id)}>
                        {st.completed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                      <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-300'}>{st.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={addSubtask} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500"
                />
                <button type="submit" className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg">
                  Add
                </button>
              </form>
            </div>

            {/* Tag Selection */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => {
                  const isSelected = selectedTask.tags?.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTaskTag(tag.name)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task Notes */}
            <div className="space-y-1.5 border-t border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</span>
              <textarea
                rows={3}
                placeholder="Add details, links, or context..."
                value={selectedTask.notes || ''}
                onChange={(e) => updateTaskNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <button
              onClick={() => deleteTask(selectedTask.id)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Task
            </button>
            <span className="text-[10px] text-slate-500 font-mono">Created {new Date(selectedTask.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, selectedTask, setSelectedTask, toggleTaskComplete, toggleStar, updateTaskDueDate, tags, getTodayStr, getTomorrowStr, getNextWeekStr, isSelectMode, isSelectedForBulk, toggleSelectTask, onRenameTask }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Enhancement 13 — inline title editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const isSelected = selectedTask?.id === task.id;
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleSaveTitle = () => {
    const trimmed = editTitleValue.trim();
    if (trimmed && trimmed !== task.title) {
      onRenameTask?.(task.id, trimmed);
    }
    setEditingTitle(false);
    setEditTitleValue('');
  };

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
        isSelectedForBulk
          ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-900/20'
          : isSelected
          ? 'bg-slate-800/90 border-indigo-500/80 shadow-md shadow-indigo-900/20'
          : task.completed
          ? 'bg-slate-950/40 border-slate-800/40 opacity-75'
          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-4">
        {isSelectMode && (
          <button
            type="button"
            onClick={(e) => toggleSelectTask(task.id, e)}
            className="shrink-0 p-1 text-slate-400 hover:text-indigo-400"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
              isSelectedForBulk ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-950'
            }`}>
              {isSelectedForBulk && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id); }}
          className="text-slate-500 hover:text-emerald-400 transition shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition" />
          )}
        </button>

        <div className="min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              type="text"
              value={editTitleValue}
              onChange={e => setEditTitleValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') { setEditingTitle(false); setEditTitleValue(''); }
              }}
              onBlur={handleSaveTitle}
              onClick={e => e.stopPropagation()}
              className="text-sm font-medium w-full bg-slate-800 border border-indigo-500 text-slate-100 px-2.5 py-0.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <p className={`text-sm font-medium transition ${task.completed ? 'line-through text-slate-400 decoration-slate-500 decoration-2' : 'text-slate-200'}`}>
                {task.title}
              </p>
              <button
                onClick={e => { e.stopPropagation(); setEditTitleValue(task.title); setEditingTitle(true); }}
                className="p-0.5 rounded text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                title="Edit task title"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Meta badges: My Day, Subtasks count, Due Date, Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-1 relative">
            {task.myDay && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-medium">
                <Sun className="w-3 h-3" /> My Day
              </span>
            )}

            {totalSubtasks > 0 && (
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            )}

            {/* Interactive Due Date Badge & Quick Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowDatePicker(!showDatePicker); }}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition ${
                  task.dueDate
                    ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                    : 'text-slate-500 bg-slate-950 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>{task.dueDate || '+ Date'}</span>
              </button>

              {showDatePicker && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-6 z-30 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl space-y-1.5 min-w-[170px] text-xs animate-slide-up"
                >
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block px-1">Set Due Date</span>
                  <button
                    onClick={() => { updateTaskDueDate(task.id, getTodayStr()); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between"
                  >
                    <span>Today</span> <span className="text-[10px] text-slate-500">{getTodayStr()}</span>
                  </button>
                  <button
                    onClick={() => { updateTaskDueDate(task.id, getTomorrowStr()); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between"
                  >
                    <span>Tomorrow</span> <span className="text-[10px] text-slate-500">{getTomorrowStr()}</span>
                  </button>
                  <button
                    onClick={() => { updateTaskDueDate(task.id, getNextWeekStr()); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between"
                  >
                    <span>Next Week</span> <span className="text-[10px] text-slate-500">{getNextWeekStr()}</span>
                  </button>

                  <div className="pt-1 border-t border-slate-800 flex items-center gap-1">
                    <input
                      type="date"
                      value={task.dueDate || ''}
                      onChange={(e) => { updateTaskDueDate(task.id, e.target.value); setShowDatePicker(false); }}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded outline-none w-full"
                    />
                  </div>

                  {task.dueDate && (
                    <button
                      onClick={() => { updateTaskDueDate(task.id, ''); setShowDatePicker(false); }}
                      className="w-full text-left px-2 py-1 hover:bg-rose-950/40 text-rose-400 rounded text-[10px]"
                    >
                      Clear Date
                    </button>
                  )}
                </div>
              )}
            </div>

            {task.routineId && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <Repeat className="w-3 h-3" /> Routine {task.routineTime ? `• ${task.routineTime}` : ''}
              </span>
            )}

            {task.tags?.map(t => {
              const tagObj = tags.find(tg => tg.name === t);
              return (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${tagObj?.color || '#6366f1'}20`, color: tagObj?.color || '#818cf8' }}
                >
                  #{t}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions Right Side */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => toggleStar(task.id, e)}
          className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${task.starred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Star className={`w-4 h-4 ${task.starred ? 'fill-amber-400' : ''}`} />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
      </div>
    </div>
  );
}

// ─── Enhancement 11 — Interactive Task Calendar Component ─────────────────────

function HistoryCalendar({ tasks, reminders = [], onSelectDay, selectedDay, onAddTaskOnDate }) {
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [focusedDay, setFocusedDay] = useState(selectedDay || '');
  const [quickTitle, setQuickTitle] = useState('');

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

  // Group tasks by date
  const completedByDate = {};
  const dueByDate = {};
  tasks.forEach(t => {
    if (t.completed) {
      const dateKey = t.completedAt || (t.createdAt ? t.createdAt.split('T')[0] : '');
      if (dateKey) completedByDate[dateKey] = (completedByDate[dateKey] || 0) + 1;
    } else if (t.dueDate) {
      dueByDate[t.dueDate] = (dueByDate[t.dueDate] || 0) + 1;
    }
  });

  const remindersByDate = {};
  reminders.forEach(r => {
    if (r.date) remindersByDate[r.date] = (remindersByDate[r.date] || 0) + 1;
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Filter tasks & reminders for selected day
  const dayTasks = tasks.filter(t => {
    if (t.completed) {
      const d = t.completedAt || (t.createdAt ? t.createdAt.split('T')[0] : '');
      return d === activeSelectedDay;
    }
    return t.dueDate === activeSelectedDay;
  });
  const dayReminders = reminders.filter(r => r.date === activeSelectedDay);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !onAddTaskOnDate) return;
    onAddTaskOnDate(quickTitle.trim(), activeSelectedDay);
    setQuickTitle('');
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 touch-pan-y animate-fade-in">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="text-center">
            <span className="text-base font-bold text-slate-100 tracking-wide block">
              {MONTH_NAMES[calendarMonth]} {calendarYear}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">Interactive Multi-View Calendar</span>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 flex items-center gap-1 text-xs"
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
            if (!day) return <div key={`empty-${idx}`} className="min-h-[44px] rounded-xl bg-slate-950/20" />;
            const dateStr = `${calendarYear}-${pad(calendarMonth + 1)}-${pad(day)}`;
            const completedCount = completedByDate[dateStr] || 0;
            const dueCount = dueByDate[dateStr] || 0;
            const reminderCount = remindersByDate[dateStr] || 0;
            const isToday = dateStr === todayCalStr;
            const isSelected = dateStr === activeSelectedDay;

            return (
              <button
                key={dateStr}
                onClick={() => { setFocusedDay(dateStr); if (onSelectDay) onSelectDay(dateStr); }}
                className={`relative flex flex-col items-center justify-between p-1.5 min-h-[50px] sm:min-h-[56px] rounded-xl text-xs font-semibold transition active:scale-95 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                    : isToday
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20'
                    : (completedCount > 0 || dueCount > 0 || reminderCount > 0)
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <span className="text-xs font-bold leading-none">{day}</span>

                {/* Badge Dots */}
                <div className="flex items-center gap-1 mt-1">
                  {dueCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} title={`${dueCount} active due tasks`} />
                  )}
                  {completedCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-400'}`} title={`${completedCount} completed tasks`} />
                  )}
                  {reminderCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-400'}`} title={`${reminderCount} scheduled reminders`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Active Due Task</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed Task</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Scheduled Reminder</span>
        </div>
      </div>

      {/* Selected Day Agenda Breakdown Drawer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-100">
              Agenda for {activeSelectedDay === todayCalStr ? `Today (${activeSelectedDay})` : activeSelectedDay}
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
            {dayTasks.length} tasks • {dayReminders.length} reminders
          </span>
        </div>

        {/* Quick Task Add for Selected Day */}
        {onAddTaskOnDate && (
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              placeholder={`Add a task for ${activeSelectedDay}...`}
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </form>
        )}

        {/* Agenda Items List */}
        {dayTasks.length === 0 && dayReminders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">No tasks or reminders recorded for this date.</p>
        ) : (
          <div className="space-y-2">
            {dayTasks.map(t => (
              <div key={t.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.completed ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  <span className={`font-medium ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  {t.completed ? (
                    <span className="text-emerald-400 font-semibold">Completed</span>
                  ) : (
                    <span className="text-indigo-400 font-semibold">Due {t.dueDate}</span>
                  )}
                </div>
              </div>
            ))}
            {dayReminders.map(r => (
              <div key={r.id} className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-slate-200">{r.title}</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">Alert: {r.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Quick Add Task Action Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {showQuickAddModal && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl w-80 animate-scale-up space-y-3 mb-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-400" /> Quick Add New Task
              </h4>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg bg-slate-800/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={(e) => { addTask(e); setShowQuickAddModal(false); }} className="space-y-3">
              <input
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
                autoFocus
              />

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">Due Date (Optional)</label>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedDueDate(getTodayStr())}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition ${
                      selectedDueDate === getTodayStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDueDate(getTomorrowStr())}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition ${
                      selectedDueDate === getTomorrowStr() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    value={selectedDueDate}
                    onChange={(e) => setSelectedDueDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg transition cursor-pointer"
              >
                Add Task Now
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowQuickAddModal(!showQuickAddModal)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title="Quick Add Task (+)"
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${showQuickAddModal ? 'rotate-45' : 'group-hover:rotate-90'}`} />
        </button>
      </div>
    </div>
  );
}

