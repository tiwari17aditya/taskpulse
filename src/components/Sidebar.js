'use client';

import { useState } from 'react';
import { Sun, Star, Calendar, CheckCircle2, ListTodo, StickyNote, Tag, Share2, Table, Terminal, Info, Plus, ChevronRight, Hash, History, BookOpen } from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  currentFilter,
  setCurrentFilter,
  tags,
  setTags,
  activeTag,
  setActiveTag,
  tasksCount,
  notesCount,
  onOpenShareModal,
  onOpenTokensModal,
  onOpenLogsModal,
  onOpenGuideModal,
}) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [showAddTag, setShowAddTag] = useState(false);

  const addTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const cleanName = newTagName.trim().replace(/^#/, '');
    if (tags.some(t => t.name.toLowerCase() === cleanName.toLowerCase())) return;

    const newTag = { id: 'tg-' + Date.now(), name: cleanName, color: newTagColor };
    setTags([...tags, newTag]);
    setNewTagName('');
    setShowAddTag(false);
  };

  const navItems = [
    { id: 'my-day', label: 'My Day', icon: Sun, color: 'text-amber-400', count: tasksCount.myDay },
    { id: 'important', label: 'Important', icon: Star, color: 'text-amber-400', count: tasksCount.important },
    { id: 'planned', label: 'Planned', icon: Calendar, color: 'text-indigo-400', count: tasksCount.planned },
    { id: 'all-tasks', label: 'Tasks', icon: ListTodo, color: 'text-blue-400', count: tasksCount.active },
    { id: 'completed', label: 'History / Completed', icon: History, color: 'text-emerald-400', count: tasksCount.completed },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-6">
        {/* App Title */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
            TP
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-none">TaskPulse</h1>
            <span className="text-[10px] text-indigo-400 font-mono">Daily Planning Workspace</span>
          </div>
        </div>

        {/* View Switcher Tabs (Tasks vs Notes) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => { setActiveView('tasks'); setActiveTag(null); }}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
              activeView === 'tasks' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" /> Tasks
          </button>

          <button
            onClick={() => { setActiveView('notes'); setActiveTag(null); }}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
              activeView === 'notes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" /> Keep Vault
          </button>
        </div>

        {/* Microsoft To-Do Smart Views */}
        {activeView === 'tasks' && (
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Smart Views</span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentFilter === item.id && !activeTag;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentFilter(item.id); setActiveTag(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-full font-mono text-slate-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Note Vault Overview */}
        {activeView === 'notes' && (
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
              <span className="flex items-center gap-1.5"><StickyNote className="w-3.5 h-3.5" /> Note Cards</span>
              <span className="font-mono bg-indigo-500/20 px-2 py-0.5 rounded-full">{notesCount} notes</span>
            </div>
            <p className="text-[11px] text-slate-400">Google Keep style masonry notes with media & colors</p>
          </div>
        )}

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </span>
            <button onClick={() => setShowAddTag(!showAddTag)} className="text-slate-400 hover:text-slate-200 p-0.5">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showAddTag && (
            <form onSubmit={addTag} className="p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded-lg outline-none"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
              <button type="submit" className="w-full py-1 bg-indigo-600 text-white rounded text-[11px] font-medium">
                Save Tag
              </button>
            </form>
          )}

          <div className="space-y-1 max-h-40 overflow-y-auto">
            {tags.map(tag => {
              const isSelected = activeTag === tag.name;
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(isSelected ? null : tag.name)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                    <span>#{tag.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Operational Tools */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        {/* Codeshare / Toffeeshare Quick Redirect button */}
        <button
          onClick={onOpenShareModal}
          className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <Share2 className="w-3.5 h-3.5" /> Codeshare Redirect
        </button>

        {/* Operational Tools */}
        <button
          onClick={onOpenGuideModal}
          className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> User Guide & Documentation
        </button>

        {/* File Tracking Triggers */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenTokensModal}
            className="py-1.5 px-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[11px] flex items-center justify-center gap-1 transition"
          >
            <Table className="w-3 h-3 text-emerald-400" /> Token Log
          </button>

          <button
            onClick={onOpenLogsModal}
            className="py-1.5 px-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[11px] flex items-center justify-center gap-1 transition"
          >
            <Terminal className="w-3 h-3 text-indigo-400" /> Daily Logs
          </button>
        </div>
      </div>
    </aside>
  );
}
