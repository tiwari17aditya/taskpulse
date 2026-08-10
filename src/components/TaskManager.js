'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Circle, Sun, Calendar, Plus, Trash2, Tag, ChevronRight, Check, X, ListTodo, Paperclip } from 'lucide-react';
import confetti from 'canvas-confetti';
import MediaUploader from './MediaUploader';
import { saveTaskToDB, deleteTaskFromDB, deleteTasksFromDB } from '@/lib/dbAdapter';

export default function TaskManager({ tasks, setTasks, tags, currentFilter, activeTag }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState('');

  // Bulk Multi-Select state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Helper date presets
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const getNextWeekStr = () => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [showCompletedSection, setShowCompletedSection] = useState(true);
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'tomorrow', 'next-week', 'custom'
  const [customFilterDate, setCustomFilterDate] = useState('');

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

  // Filter tasks according to selected view & date filter
  const categoryTasks = tasks.filter(task => {
    if (activeTag) return task.tags && task.tags.includes(activeTag);
    if (currentFilter === 'my-day') return task.myDay;
    if (currentFilter === 'important') return task.starred;
    if (currentFilter === 'planned') return !!task.dueDate;
    if (currentFilter === 'completed') return task.completed;

    // Date Filter Sub-filtering
    if (filterDate === 'today') return task.dueDate === getTodayStr() || task.dueDate === 'Today';
    if (filterDate === 'tomorrow') return task.dueDate === getTomorrowStr() || task.dueDate === 'Tomorrow';
    if (filterDate === 'next-week') return task.dueDate === getNextWeekStr() || task.dueDate === 'Next Week';
    if (filterDate === 'custom' && customFilterDate) return task.dueDate === customFilterDate;

    return true; // All tasks
  });

  const activeTasks = currentFilter === 'completed' ? [] : categoryTasks.filter(t => !t.completed);
  const completedTasks = currentFilter === 'completed' ? categoryTasks : categoryTasks.filter(t => t.completed);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const initialDueDate = selectedDueDate || (currentFilter === 'planned' ? getTodayStr() : '');

    const newTask = {
      id: 't-' + Date.now(),
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

  const toggleTaskComplete = (taskId) => {
    let targetTask = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
        targetTask = { ...t, completed: isNowCompleted };
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

  return (
    <div className="flex gap-6 h-full relative">
      {/* Main Task List Column */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Quick Add Task Bar & Date Presets */}
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

        {/* Tasks List Container */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {/* 1. Active Tasks Section */}
          {activeTasks.length === 0 && completedTasks.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-xl">
              <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No active tasks in this view</p>
              <p className="text-xs text-slate-500">Type above to create your first item</p>
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
                />
              ))}
            </div>
          )}

          {/* 2. Completed / History Tasks Section (with Strikethrough Cut Lines) */}
          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowCompletedSection(!showCompletedSection)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider flex items-center gap-2 py-1"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed Items ({completedTasks.length})</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">({showCompletedSection ? 'Hide' : 'Show'})</span>
              </button>

              {showCompletedSection && (
                <div className="space-y-2">
                  {completedTasks.map((task) => (
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
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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

function TaskCard({ task, selectedTask, setSelectedTask, toggleTaskComplete, toggleStar, updateTaskDueDate, tags, getTodayStr, getTomorrowStr, getNextWeekStr, isSelectMode, isSelectedForBulk, toggleSelectTask }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isSelected = selectedTask?.id === task.id;
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

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
          <p className={`text-sm font-medium transition ${task.completed ? 'line-through text-slate-400 decoration-slate-500 decoration-2' : 'text-slate-200'}`}>
            {task.title}
          </p>

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
