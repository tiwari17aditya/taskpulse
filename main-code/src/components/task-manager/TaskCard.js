'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Circle, Sun, Calendar, Check, Pencil, Repeat, ChevronRight } from 'lucide-react';

export default function TaskCard({
  task,
  selectedTask,
  setSelectedTask,
  toggleTaskComplete,
  toggleStar,
  updateTaskDueDate,
  tags = [],
  getTodayStr,
  getTomorrowStr,
  getNextWeekStr,
  isSelectMode = false,
  isSelectedForBulk = false,
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
      onClick={() => setSelectedTask?.(task)}
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
            onClick={(e) => toggleSelectTask?.(task.id, e)}
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
          onClick={(e) => { e.stopPropagation(); toggleTaskComplete?.(task.id); }}
          className="text-slate-500 hover:text-emerald-400 transition shrink-0 cursor-pointer"
          title={task.completed ? "Mark as active / uncompleted" : "Mark as completed"}
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
                    onClick={() => { updateTaskDueDate?.(task.id, getTodayStr ? getTodayStr() : new Date().toISOString().split('T')[0]); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between cursor-pointer"
                  >
                    <span>Today</span> <span className="text-[10px] text-slate-500">{getTodayStr ? getTodayStr() : ''}</span>
                  </button>
                  <button
                    onClick={() => { updateTaskDueDate?.(task.id, getTomorrowStr ? getTomorrowStr() : ''); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between cursor-pointer"
                  >
                    <span>Tomorrow</span> <span className="text-[10px] text-slate-500">{getTomorrowStr ? getTomorrowStr() : ''}</span>
                  </button>
                  <button
                    onClick={() => { updateTaskDueDate?.(task.id, getNextWeekStr ? getNextWeekStr() : ''); setShowDatePicker(false); }}
                    className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded text-slate-200 text-[11px] flex items-center justify-between cursor-pointer"
                  >
                    <span>Next Week</span> <span className="text-[10px] text-slate-500">{getNextWeekStr ? getNextWeekStr() : ''}</span>
                  </button>

                  <div className="pt-1 border-t border-slate-800 flex items-center gap-1">
                    <input
                      type="date"
                      value={task.dueDate || ''}
                      onChange={(e) => { updateTaskDueDate?.(task.id, e.target.value); setShowDatePicker(false); }}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded outline-none w-full"
                    />
                  </div>

                  {task.dueDate && (
                    <button
                      onClick={() => { updateTaskDueDate?.(task.id, ''); setShowDatePicker(false); }}
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
          onClick={(e) => toggleStar?.(task.id, e)}
          className={`p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer ${task.starred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Star className={`w-4 h-4 ${task.starred ? 'fill-amber-400' : ''}`} />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
      </div>
    </div>
  );
}
