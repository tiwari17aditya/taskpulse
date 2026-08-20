'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, X, Sun, Star, Calendar, Check, Tag, Trash2 } from 'lucide-react';
import { getTodayStr, getTomorrowStr, getNextWeekStr } from '@/lib/dateUtils';

export default function TaskDetailDrawer({
  selectedTask,
  onClose,
  toggleTaskComplete,
  toggleMyDay,
  toggleStar,
  updateTaskDueDate,
  addSubtask,
  toggleSubtask,
  newSubtaskTitle,
  setNewSubtaskTitle,
  tags = [],
  toggleTaskTag,
  updateTaskNotes,
  deleteTask
}) {
  if (!selectedTask) return null;

  return (
    <div className="fixed inset-0 z-40 lg:relative lg:inset-auto bg-slate-950/80 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent flex justify-end lg:block p-3 lg:p-0">
      <div className="w-full max-w-md lg:w-80 xl:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4 animate-fade-in shrink-0 h-full max-h-[85vh] lg:max-h-none overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => toggleTaskComplete(selectedTask.id)} className="cursor-pointer">
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
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions (My Day & Priority) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => toggleMyDay(selectedTask.id, e)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
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
              className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                selectedTask.starred
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${selectedTask.starred ? 'fill-amber-400' : ''}`} />
              {selectedTask.starred ? 'Starred' : 'Star Task'}
            </button>
          </div>

          {/* Repeat Schedule & Iterations Info (If routine or recurring) */}
          {(selectedTask.routineId || selectedTask.isRecurring) && (
            <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between text-indigo-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-indigo-400" /> Recurring Schedule
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-500/20 rounded">
                  {selectedTask.frequency || 'Daily'} {selectedTask.interval > 1 ? `(Every ${selectedTask.interval})` : ''}
                </span>
              </div>
              {selectedTask.maxIterations && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-indigo-500/20">
                  <span>Iteration Progress:</span>
                  <span className="font-mono font-bold text-amber-300">
                    Iteration #{selectedTask.iterationNumber || 1} of {selectedTask.maxIterations} max
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Due Date Selector Block */}
          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Due Date</span>
              {selectedTask.dueDate && (
                <button onClick={() => updateTaskDueDate(selectedTask.id, '')} className="text-[10px] text-rose-400 hover:underline cursor-pointer">
                  Clear Date
                </button>
              )}
            </span>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => updateTaskDueDate(selectedTask.id, getTodayStr())}
                className={`py-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
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
                className={`py-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
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
                className={`py-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
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
                    <button onClick={() => toggleSubtask(st.id)} className="cursor-pointer">
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
              <button type="submit" className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg cursor-pointer">
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
                    className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 cursor-pointer ${
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
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Task
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Created {new Date(selectedTask.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
