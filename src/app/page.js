'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TaskManager from '@/components/TaskManager';
import NoteCanvas from '@/components/NoteCanvas';
import ShareRedirectModal from '@/components/ShareRedirectModal';
import TokenUsageModal from '@/components/TokenUsageModal';
import LogViewerModal from '@/components/LogViewerModal';
import { storage } from '@/lib/storage';
import { getCurrentDBProvider } from '@/lib/dbAdapter';
import { Sun, Calendar, Star, CheckCircle2, ListTodo, StickyNote, Tag, Cloud, ShieldCheck, Database } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'notes'
  const [currentFilter, setCurrentFilter] = useState('my-day'); // 'my-day', 'important', 'planned', 'all-tasks', 'completed'
  const [activeTag, setActiveTag] = useState(null);

  const dbProvider = getCurrentDBProvider();
  const dbLabel = dbProvider === 'neondb' ? 'NeonDB PostgreSQL Active'
    : dbProvider === 'supabase' ? 'Supabase Storage Ready'
    : dbProvider === 'postgres' ? 'PostgreSQL Active'
    : 'Local Storage Ready';

  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);

  // Modals state
  const [shareItem, setShareItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTokensModal, setShowTokensModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Load initial data
  useEffect(() => {
    setTasks(storage.getTasks());
    setNotes(storage.getNotes());
    setTags(storage.getTags());
  }, []);

  // Save tasks on change
  useEffect(() => {
    if (tasks.length > 0) storage.saveTasks(tasks);
  }, [tasks]);

  // Save notes on change
  useEffect(() => {
    if (notes.length > 0) storage.saveNotes(notes);
  }, [notes]);

  // Save tags on change
  useEffect(() => {
    if (tags.length > 0) storage.saveTags(tags);
  }, [tags]);

  // Tasks counts for sidebar
  const tasksCount = {
    myDay: tasks.filter(t => t.myDay && !t.completed).length,
    important: tasks.filter(t => t.starred && !t.completed).length,
    planned: tasks.filter(t => t.dueDate && !t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  const handleOpenShareModal = (itemToShare = null) => {
    setShareItem(itemToShare);
    setShowShareModal(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        tags={tags}
        setTags={setTags}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        tasksCount={tasksCount}
        notesCount={notes.length}
        onOpenShareModal={() => handleOpenShareModal(null)}
        onOpenTokensModal={() => setShowTokensModal(true)}
        onOpenLogsModal={() => setShowLogsModal(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeView === 'tasks' ? (
              <div className="flex items-center gap-2">
                {currentFilter === 'my-day' && <Sun className="w-5 h-5 text-amber-400" />}
                {currentFilter === 'important' && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                {currentFilter === 'planned' && <Calendar className="w-5 h-5 text-indigo-400" />}
                {currentFilter === 'all-tasks' && <ListTodo className="w-5 h-5 text-blue-400" />}
                {currentFilter === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                <h2 className="text-lg font-bold text-slate-100 capitalize">
                  {activeTag ? `Tag: #${activeTag}` : currentFilter.replace('-', ' ')}
                </h2>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  {activeTag ? `Notes Tagged #${activeTag}` : 'Keep Note Vault'}
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full font-medium text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> {dbLabel}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono text-[10px]">
              <ShieldCheck className="w-3 h-3" /> v1.0.0-alpha
            </span>
          </div>
        </header>

        {/* View Content Body */}
        <div className="p-6 flex-1 overflow-hidden">
          {activeView === 'tasks' ? (
            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              tags={tags}
              currentFilter={currentFilter}
              activeTag={activeTag}
            />
          ) : (
            <NoteCanvas
              notes={notes}
              setNotes={setNotes}
              tags={tags}
              activeTag={activeTag}
              onShareNote={(note) => handleOpenShareModal({ title: note.title, content: note.content, media: note.media })}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showShareModal && (
        <ShareRedirectModal
          initialItem={shareItem}
          onClose={() => { setShowShareModal(false); setShareItem(null); }}
        />
      )}

      {showTokensModal && (
        <TokenUsageModal onClose={() => setShowTokensModal(false)} />
      )}

      {showLogsModal && (
        <LogViewerModal onClose={() => setShowLogsModal(false)} />
      )}
    </div>
  );
}
