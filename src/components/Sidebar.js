'use client';

import { useState } from 'react';
import { Sun, Star, Calendar, ListTodo, StickyNote, Tag, Share2, Plus, History, BookOpen, X, Bell, User, ChevronDown, Repeat, ShieldCheck } from 'lucide-react';

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
  isMobileOpen,
  onCloseMobile,
  activeProfile,
  onOpenProfileModal,
  onOpenNotificationModal,
  remindersCount,
  onOpenAdminModal,
}) {
  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900/90 border-r border-slate-800/80 flex-col justify-between p-4 select-none shrink-0 h-screen overflow-y-auto">
        <SidebarInner
          activeView={activeView}
          setActiveView={setActiveView}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          tags={tags}
          setTags={setTags}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          tasksCount={tasksCount}
          notesCount={notesCount}
          onOpenShareModal={onOpenShareModal}
          onOpenTokensModal={onOpenTokensModal}
          onOpenLogsModal={onOpenLogsModal}
          onOpenGuideModal={onOpenGuideModal}
          activeProfile={activeProfile}
          onOpenProfileModal={onOpenProfileModal}
          onOpenNotificationModal={onOpenNotificationModal}
          remindersCount={remindersCount}
          onOpenAdminModal={onOpenAdminModal}
        />
      </aside>

      {/* Mobile Slide-Over Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-md flex">
          <div className="w-72 bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-right relative">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarInner
              activeView={activeView}
              setActiveView={(v) => { setActiveView(v); onCloseMobile(); }}
              currentFilter={currentFilter}
              setCurrentFilter={(f) => { setCurrentFilter(f); onCloseMobile(); }}
              tags={tags}
              setTags={setTags}
              activeTag={activeTag}
              setActiveTag={(t) => { setActiveTag(t); onCloseMobile(); }}
              tasksCount={tasksCount}
              notesCount={notesCount}
              onOpenShareModal={() => { onOpenShareModal(); onCloseMobile(); }}
              onOpenTokensModal={() => { onOpenTokensModal(); onCloseMobile(); }}
              onOpenLogsModal={() => { onOpenLogsModal(); onCloseMobile(); }}
              onOpenGuideModal={() => { onOpenGuideModal(); onCloseMobile(); }}
              activeProfile={activeProfile}
              onOpenProfileModal={() => { onOpenProfileModal(); onCloseMobile(); }}
              onOpenNotificationModal={() => { onOpenNotificationModal(); onCloseMobile(); }}
              remindersCount={remindersCount}
              onOpenAdminModal={() => { onOpenAdminModal(); onCloseMobile(); }}
            />
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}

function SidebarInner({
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
  activeProfile,
  onOpenProfileModal,
  onOpenNotificationModal,
  remindersCount,
  onOpenAdminModal
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
    { id: 'planned', label: 'Planned / Calendar', icon: Calendar, color: 'text-indigo-400', count: tasksCount.planned },
    { id: 'all-tasks', label: 'Tasks', icon: ListTodo, color: 'text-blue-400', count: tasksCount.active },
    { id: 'completed', label: 'History / Completed', icon: History, color: 'text-emerald-400', count: tasksCount.completed },
  ];

  return (
    <div className="flex flex-col justify-between min-h-full space-y-6">
      <div className="space-y-6">
        {/* App Title & Multi-User Profile Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                TP
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 leading-none">TaskPulse</h1>
                <span className="text-[10px] text-indigo-400 font-mono">Daily Planning Workspace</span>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotificationModal}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition cursor-pointer"
              title="Notification & Reminder Center"
            >
              <Bell className="w-4 h-4" />
              {remindersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {remindersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Profile Switcher Badge */}
          <button
            onClick={onOpenProfileModal}
            className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm"
                style={{ backgroundColor: `${activeProfile?.color || '#6366f1'}25`, border: `1px solid ${activeProfile?.color || '#6366f1'}40` }}
              >
                {activeProfile?.avatar || '👤'}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200 block leading-tight">{activeProfile?.name || 'Personal'}</span>
                <span className="text-[10px] text-slate-500 block">{activeProfile?.role || 'Switch Profile'}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
          </button>
        </div>

        {/* View Switcher Tabs (Tasks vs Notes vs Routine vs Admin) */}
        <div className={`grid ${activeProfile?.role === 'Admin' ? 'grid-cols-4' : 'grid-cols-3'} gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl`}>
          <button
            onClick={() => { setActiveView('tasks'); setActiveTag(null); }}
            className={`py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
              activeView === 'tasks' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" /> Tasks
          </button>

          <button
            onClick={() => { setActiveView('notes'); setActiveTag(null); }}
            className={`py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
              activeView === 'notes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" /> Notes
          </button>

          <button
            onClick={() => { setActiveView('routine'); setActiveTag(null); }}
            className={`py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
              activeView === 'routine' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" /> Routine
          </button>

          {activeProfile?.role === 'Admin' && (
            <button
              onClick={() => { setActiveView('admin'); setActiveTag(null); }}
              className={`py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeView === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Admin
            </button>
          )}
        </div>

        {/* Smart Filters List (Tasks View) */}
        {activeView === 'tasks' && (
          <nav className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 block mb-1">
              Views & Filters
            </span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = currentFilter === item.id && !activeTag;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentFilter(item.id); setActiveTag(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
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

        {/* Routine Manager Overview Card */}
        {activeView === 'routine' && (
          <div className="p-3.5 bg-gradient-to-br from-amber-500/15 via-indigo-950/40 to-slate-900 border border-amber-500/30 rounded-xl space-y-2 shadow-lg shadow-amber-500/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-100 block leading-tight">Daily Routine</span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">Recurring Engine</span>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Automated habit builder with editable target times, streaks 🔥 & My Day sync.
            </p>
          </div>
        )}

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </span>
            <button onClick={() => setShowAddTag(!showAddTag)} className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer">
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
              <button type="submit" className="w-full py-1 bg-indigo-600 text-white rounded text-[11px] font-medium cursor-pointer">
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
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
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
        {/* Admin Control Panel Button (Admin Only) */}
        {activeProfile?.role === 'Admin' && (
          <button
            onClick={onOpenAdminModal}
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 via-indigo-600 to-violet-600 hover:from-amber-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" /> Admin Control Panel
          </button>
        )}

        {/* Open-Source Sharing Utilities button */}
        <button
          onClick={onOpenShareModal}
          className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" /> Open-Source Sharing Utilities
        </button>

        {/* User Guide */}
        <button
          onClick={onOpenGuideModal}
          className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> User Guide & Documentation
        </button>
      </div>
    </div>
  );
}
