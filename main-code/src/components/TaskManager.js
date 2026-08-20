'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Circle, Sun, Calendar, Plus, Trash2, Tag, ChevronRight, Check, ListTodo, Pencil, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveTaskToDB, deleteTaskFromDB, deleteTasksFromDB } from '@/lib/dbAdapter';
import { getLocalDateStr, getTodayStr, getTomorrowStr, getNextWeekStr, getYesterdayStr } from '@/lib/dateUtils';
import TaskCalendarView from './task-manager/TaskCalendarView';
import QuickAddTaskModal from './task-manager/QuickAddTaskModal';
import TaskDetailDrawer from './task-manager/TaskDetailDrawer';

export default function TaskManager({
  tasks,
  setTasks,
  tags,
  currentFilter,
  activeTag,
  reminders = [],
  routines = [],
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

  const handleCreateTaskFromFAB = (newTask) => {
    setTasks([newTask, ...tasks]);
    saveTaskToDB(newTask);
  };

  const addTaskOnDate = (title, dateStr) => {
    if (!title || !title.trim()) return;
    const newTask = {
      id: 't-' + Date.now(),
      profileId: activeProfile?.id || 'p-aditya',
      title: title.trim(),
      completed: false,
      myDay: false,
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
        const completedDate = task.completedAt || (task.createdAt ? task.createdAt.split('T')[0] : '');
        return completedDate === todayStr;
      }
    } else {
      if (filterDate !== 'all') {
        if (filterDate === 'today') return task.dueDate === todayStr || task.dueDate === 'Today';
        if (filterDate === 'tomorrow') return task.dueDate === getTomorrowStr() || task.dueDate === 'Tomorrow';
        if (filterDate === 'next-week') return task.dueDate === getNextWeekStr() || task.dueDate === 'Next Week';
        if (filterDate === 'custom' && customFilterDate) return task.dueDate === customFilterDate;
        return false;
      }
    }

    return true;
  });

  const activeTasks = currentFilter === 'completed' ? [] : categoryTasks.filter(t => !t.completed);
  const completedTasks = currentFilter === 'completed' ? categoryTasks : categoryTasks.filter(t => t.completed);

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
    saveTaskToDB(newTask);
    setNewTaskTitle('');
    setSelectedDueDate('');
  };

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
    if (targetTask) saveTaskToDB(targetTask);
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
    deleteTaskFromDB(taskId);
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const toggleSelectTask = (taskId, e) => {
    e?.stopPropagation();
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const selectAllCategoryTasks = () => {
    setSelectedTaskIds(categoryTasks.map(t => t.id));
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

        {/* Date Filter & Multi-Select Toolbars */}
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    filterDate === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Dates
                </button>
                <button
                  onClick={() => setFilterDate('today')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    filterDate === 'today' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setFilterDate('tomorrow')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    filterDate === 'tomorrow' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setFilterDate('next-week')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    filterDate === 'next-week' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Next Week
                </button>
                {/* Flexible Date Filter */}
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5">
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={customFilterDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomFilterDate(val);
                      setFilterDate(val.trim() ? 'custom' : 'all');
                    }}
                    className="w-24 bg-transparent text-slate-200 text-[11px] outline-none font-mono placeholder:text-slate-600"
                    title="Type date manually (YYYY-MM-DD) or pick from calendar"
                  />
                  <input
                    type="date"
                    value={customFilterDate}
                    onChange={(e) => {
                      setCustomFilterDate(e.target.value);
                      setFilterDate(e.target.value ? 'custom' : 'all');
                    }}
                    className="w-5 h-5 bg-transparent border-0 text-slate-300 text-[11px] cursor-pointer outline-none shrink-0"
                    title="Open calendar date picker"
                  />
                </div>
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
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
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
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
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedTaskIds.length})
                  </button>
                )}
                {categoryTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAllCategoryTasks}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                plannedSubView === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" /> List View
            </button>
            <button
              onClick={() => setPlannedSubView('calendar')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                plannedSubView === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar View
            </button>
          </div>
        )}

        {/* History Controls in Completed view */}
        {currentFilter === 'completed' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => setHistorySubView('list')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  historySubView === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" /> List View
              </button>
              <button
                onClick={() => setHistorySubView('calendar')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  historySubView === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Calendar View
              </button>
            </div>

            {(!isCalendarMode || showCalendarFilters) && (
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Filter History
                  </span>
                  {(historyPreset !== 'all' || historyDateFrom || historyDateTo) && (
                    <button
                      onClick={clearHistoryFilters}
                      className="text-[11px] text-rose-400 hover:text-rose-300 transition font-medium cursor-pointer"
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
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
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

        {/* Calendar View */}
        {((currentFilter === 'completed' && historySubView === 'calendar') ||
          (currentFilter === 'planned' && plannedSubView === 'calendar')) && (
          <TaskCalendarView
            tasks={tasks}
            reminders={reminders}
            routines={routines}
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
            {/* Active Tasks Section */}
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
                    : 'Type above or click (+) to create your first item'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentFilter === 'my-day' ? (
                  <>
                    {activeTasks.filter(t => !t.routineId).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                          <Sun className="w-3.5 h-3.5" /> ☀️ Regular Focus Tasks ({activeTasks.filter(t => !t.routineId).length})
                        </div>
                        {activeTasks.filter(t => !t.routineId).map((task) => (
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

                    {activeTasks.filter(t => t.routineId).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-2 px-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          <Repeat className="w-3.5 h-3.5 text-indigo-400" /> 🔁 Routine Tasks & Daily Habits ({activeTasks.filter(t => t.routineId).length})
                        </div>
                        {activeTasks.filter(t => t.routineId).map((task) => (
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
                  </>
                ) : (
                  <div className="space-y-2">
                    {currentFilter === 'completed'
                      ? historyFilteredTasks.map((task) => (
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
                        ))
                      : activeTasks.map((task) => (
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

                {/* Completed Tasks Accordion */}
                {currentFilter !== 'completed' && completedTasks.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => setShowCompletedSection(!showCompletedSection)}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer mb-2 px-1"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${showCompletedSection ? 'rotate-90' : ''}`} />
                      <span>Completed ({completedTasks.length})</span>
                    </button>

                    {showCompletedSection && (
                      <div className="space-y-2 animate-fade-in">
                        {completedTasks.map((task) => (
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        selectedTask={selectedTask}
        onClose={() => setSelectedTask(null)}
        toggleTaskComplete={toggleTaskComplete}
        toggleMyDay={toggleMyDay}
        toggleStar={toggleStar}
        updateTaskDueDate={updateTaskDueDate}
        addSubtask={addSubtask}
        toggleSubtask={toggleSubtask}
        newSubtaskTitle={newSubtaskTitle}
        setNewSubtaskTitle={setNewSubtaskTitle}
        tags={tags}
        toggleTaskTag={toggleTaskTag}
        updateTaskNotes={updateTaskNotes}
        deleteTask={deleteTask}
      />

      {/* Quick Add FAB Modal */}
      <QuickAddTaskModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSubmit={handleCreateTaskFromFAB}
        tags={tags}
        activeTag={activeTag}
        activeProfile={activeProfile}
      />

      {/* Floating Action Button (+) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setShowQuickAddModal(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/60 ring-4 ring-indigo-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title="Quick Add Task (+)"
        >
          <Plus className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  selectedTask,
  setSelectedTask,
  toggleTaskComplete,
  toggleStar,
  updateTaskDueDate,
  tags,
  getTodayStr,
  getTomorrowStr,
  getNextWeekStr,
  isSelectMode,
  isSelectedForBulk,
  toggleSelectTask,
  onRenameTask
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
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
            className="shrink-0 p-1 text-slate-400 hover:text-indigo-400 cursor-pointer"
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
          className="text-slate-500 hover:text-emerald-400 transition shrink-0 cursor-pointer"
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
                className="p-0.5 rounded text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition shrink-0 cursor-pointer"
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
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
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
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between cursor-pointer"
                  >
                    <span>Today</span> <span className="text-[10px] text-slate-500">{getTodayStr()}</span>
                  </button>
                  <button
                    onClick={() => { updateTaskDueDate(task.id, getTomorrowStr()); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between cursor-pointer"
                  >
                    <span>Tomorrow</span> <span className="text-[10px] text-slate-500">{getTomorrowStr()}</span>
                  </button>
                  <button
                    onClick={() => { updateTaskDueDate(task.id, getNextWeekStr()); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between cursor-pointer"
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
                      className="w-full text-left px-2 py-1 hover:bg-rose-950/40 text-rose-400 rounded text-[10px] cursor-pointer"
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

      {/* Star & Chevron Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => toggleStar(task.id, e)}
          className={`p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer ${task.starred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Star className={`w-4 h-4 ${task.starred ? 'fill-amber-400' : ''}`} />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
      </div>
    </div>
  );
}
