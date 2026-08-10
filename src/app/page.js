'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TaskManager from '@/components/TaskManager';
import NoteCanvas from '@/components/NoteCanvas';
import ShareRedirectModal from '@/components/ShareRedirectModal';
import TokenUsageModal from '@/components/TokenUsageModal';
import LogViewerModal from '@/components/LogViewerModal';
import { storage } from '@/lib/storage';
import { getCurrentDBProvider, fetchTasksFromDB, saveTaskToDB, fetchNotesFromDB, saveNoteToDB } from '@/lib/dbAdapter';
import UserGuideModal from '@/components/UserGuideModal';
import { Sun, Calendar, Star, CheckCircle2, ListTodo, StickyNote, Tag, Cloud, ShieldCheck, Database, BookOpen } from 'lucide-react';

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
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Load initial data from DB / Local
  useEffect(() => {
    const initialLocalTasks = storage.getTasks();
    const initialLocalNotes = storage.getNotes();

    setTasks(initialLocalTasks);
    setNotes(initialLocalNotes);
    setTags(storage.getTags());

    // Sync with NeonDB / Supabase remote API
    fetchTasksFromDB().then(dbTasks => {
      if (dbTasks && dbTasks.length > 0) {
        setTasks(dbTasks);
      } else if (initialLocalTasks.length > 0) {
        // Trigger auto-table creation and sync initial tasks to NeonDB
        initialLocalTasks.forEach(t => saveTaskToDB(t));
      }
    });

    fetchNotesFromDB().then(dbNotes => {
      if (dbNotes && dbNotes.length > 0) {
        setNotes(dbNotes);
      } else if (initialLocalNotes.length > 0) {
        // Trigger auto-table creation and sync initial notes to NeonDB
        initialLocalNotes.forEach(n => saveNoteToDB(n));
      }
    });
  }, []);

  // Save tasks on change & sync to NeonDB
  const handleSetTasks = (newTasks) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
    // Sync all updated tasks to active DB provider (NeonDB / Supabase)
    if (Array.isArray(newTasks)) {
      newTasks.forEach(t => saveTaskToDB(t));
    }
  };

  // Save notes on change & sync to NeonDB
  const handleSetNotes = (newNotes) => {
    setNotes(newNotes);
    storage.saveNotes(newNotes);
    if (Array.isArray(newNotes)) {
      newNotes.forEach(n => saveNoteToDB(n));
    }
  };

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
        onOpenGuideModal={() => setShowGuideModal(true)}
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
              setTasks={handleSetTasks}
              tags={tags}
              currentFilter={currentFilter}
              activeTag={activeTag}
            />
          ) : (
            <NoteCanvas
              notes={notes}
              setNotes={handleSetNotes}
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

      {showGuideModal && (
        <UserGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
}
